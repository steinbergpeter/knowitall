import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12">
      <Image
        src="/globe.svg"
        alt="Knowledge Globe"
        width={120}
        height={120}
        className="mb-6"
      />
      <h1 className="text-4xl font-bold mb-4 text-center">
        Welcome to KnowItAll
      </h1>
      <p className="text-lg text-muted-foreground text-center max-w-xl mb-8">
        Create a project, upload your documents, and let AI build a knowledge
        graph for you. Get answers, explore connections, and unlock insights
        from your data.
      </p>
      {/* You can add a call-to-action button here, e.g. to go to /projects */}
    </main>
  )
}
