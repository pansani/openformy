package tasks

import (
	"github.com/occult/pagode/pkg/services"
)

// Register registers all task queues with the task client.
func Register(c *services.Container) {
	c.Tasks.Register(NewExampleTaskQueue(c))
}

// RegisterJobs registers all job handlers with the job worker.
func RegisterJobs(c *services.Container) {
	c.Jobs.Register("extract_brand_colors", ExtractBrandColors(c.ORM))
}
