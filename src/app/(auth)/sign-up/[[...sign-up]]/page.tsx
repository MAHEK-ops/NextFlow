import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-surface border border-border shadow-none",
            headerTitle: "text-foreground",
            headerSubtitle: "text-foreground-secondary",
            formFieldLabel: "text-foreground-secondary",
            formFieldInput:
              "bg-surface-raised border-border text-foreground placeholder:text-muted-foreground focus:border-accent",
            formButtonPrimary:
              "bg-accent hover:bg-accent-light text-white",
            footerActionLink: "text-accent hover:text-accent-light",
            identityPreviewText: "text-foreground",
            identityPreviewEditButton: "text-accent",
          },
        }}
      />
    </div>
  );
}
