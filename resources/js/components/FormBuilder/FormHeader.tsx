interface FormHeaderProps {
  title: string;
  description?: string;
}

export function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <div className="p-6 border-b bg-background/50 backdrop-blur">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
