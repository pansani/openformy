package services

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/occult/pagode/config"
	"github.com/spf13/afero"
)

type FileStorage interface {
	afero.Fs
	GetPublicURL(path string) string
}

type LocalStorage struct {
	afero.Fs
}

func (l *LocalStorage) GetPublicURL(path string) string {
	return "/files/" + path
}

type S3Storage struct {
	client    *s3.S3
	bucket    string
	publicURL string
}

func NewS3Storage(cfg config.S3Config) (*S3Storage, error) {
	awsConfig := &aws.Config{
		Region:           aws.String(cfg.Region),
		Credentials:      credentials.NewStaticCredentials(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		S3ForcePathStyle: aws.Bool(cfg.UsePathStyleEndpoint),
	}

	if cfg.Endpoint != "" {
		awsConfig.Endpoint = aws.String(cfg.Endpoint)
	}

	sess, err := session.NewSession(awsConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	return &S3Storage{
		client:    s3.New(sess),
		bucket:    cfg.Bucket,
		publicURL: cfg.PublicURL,
	}, nil
}

func (s *S3Storage) Create(name string) (afero.File, error) {
	return &s3File{
		storage: s,
		path:    name,
		buffer:  &bytes.Buffer{},
	}, nil
}

func (s *S3Storage) Mkdir(name string, perm os.FileMode) error {
	return nil
}

func (s *S3Storage) MkdirAll(path string, perm os.FileMode) error {
	return nil
}

func (s *S3Storage) Open(name string) (afero.File, error) {
	result, err := s.client.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(name),
	})
	if err != nil {
		return nil, err
	}

	data, err := io.ReadAll(result.Body)
	result.Body.Close()
	if err != nil {
		return nil, err
	}

	return &s3File{
		storage: s,
		path:    name,
		buffer:  bytes.NewBuffer(data),
	}, nil
}

func (s *S3Storage) OpenFile(name string, flag int, perm os.FileMode) (afero.File, error) {
	return s.Open(name)
}

func (s *S3Storage) Remove(name string) error {
	_, err := s.client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(name),
	})
	return err
}

func (s *S3Storage) RemoveAll(path string) error {
	return s.Remove(path)
}

func (s *S3Storage) Rename(oldname, newname string) error {
	_, err := s.client.CopyObject(&s3.CopyObjectInput{
		Bucket:     aws.String(s.bucket),
		CopySource: aws.String(filepath.Join(s.bucket, oldname)),
		Key:        aws.String(newname),
	})
	if err != nil {
		return err
	}

	return s.Remove(oldname)
}

func (s *S3Storage) Stat(name string) (os.FileInfo, error) {
	result, err := s.client.HeadObject(&s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(name),
	})
	if err != nil {
		return nil, err
	}

	return &s3FileInfo{
		name: filepath.Base(name),
		size: *result.ContentLength,
	}, nil
}

func (s *S3Storage) Name() string {
	return "S3Storage"
}

func (s *S3Storage) Chmod(name string, mode os.FileMode) error {
	return nil
}

func (s *S3Storage) Chown(name string, uid, gid int) error {
	return nil
}

func (s *S3Storage) Chtimes(name string, atime, mtime time.Time) error {
	return nil
}

func (s *S3Storage) GetPublicURL(path string) string {
	if s.publicURL != "" {
		return s.publicURL + "/" + path
	}
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, aws.StringValue(s.client.Config.Region), path)
}

type s3File struct {
	storage *S3Storage
	path    string
	buffer  *bytes.Buffer
	closed  bool
}

func (f *s3File) Close() error {
	if f.closed {
		return nil
	}

	f.closed = true

	if f.buffer.Len() > 0 {
		_, err := f.storage.client.PutObject(&s3.PutObjectInput{
			Bucket: aws.String(f.storage.bucket),
			Key:    aws.String(f.path),
			Body:   bytes.NewReader(f.buffer.Bytes()),
			ACL:    aws.String("public-read"),
		})
		return err
	}

	return nil
}

func (f *s3File) Read(p []byte) (n int, err error) {
	return f.buffer.Read(p)
}

func (f *s3File) ReadAt(p []byte, off int64) (n int, err error) {
	return 0, fmt.Errorf("ReadAt not implemented")
}

func (f *s3File) Seek(offset int64, whence int) (int64, error) {
	return 0, fmt.Errorf("Seek not implemented")
}

func (f *s3File) Write(p []byte) (n int, err error) {
	return f.buffer.Write(p)
}

func (f *s3File) WriteAt(p []byte, off int64) (n int, err error) {
	return 0, fmt.Errorf("WriteAt not implemented")
}

func (f *s3File) Name() string {
	return f.path
}

func (f *s3File) Readdir(count int) ([]os.FileInfo, error) {
	return nil, fmt.Errorf("Readdir not implemented")
}

func (f *s3File) Readdirnames(n int) ([]string, error) {
	return nil, fmt.Errorf("Readdirnames not implemented")
}

func (f *s3File) Stat() (os.FileInfo, error) {
	return f.storage.Stat(f.path)
}

func (f *s3File) Sync() error {
	return nil
}

func (f *s3File) Truncate(size int64) error {
	return fmt.Errorf("Truncate not implemented")
}

func (f *s3File) WriteString(s string) (ret int, err error) {
	return f.buffer.WriteString(s)
}

type s3FileInfo struct {
	name string
	size int64
}

func (fi *s3FileInfo) Name() string       { return fi.name }
func (fi *s3FileInfo) Size() int64        { return fi.size }
func (fi *s3FileInfo) Mode() os.FileMode  { return 0644 }
func (fi *s3FileInfo) ModTime() time.Time { return time.Time{} }
func (fi *s3FileInfo) IsDir() bool        { return false }
func (fi *s3FileInfo) Sys() interface{}   { return nil }
