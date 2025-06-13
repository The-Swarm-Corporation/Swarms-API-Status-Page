import { Terminal } from "lucide-react"

export default function StatusHeader() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex items-center mb-4">
        <Terminal className="h-10 w-10 text-red-600 mr-2" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Enterprise Agent Swarm <span className="text-red-600">Management</span>
        </h1>
      </div>
      <p className="text-lg text-gray-400 max-w-2xl">
        Real-time monitoring and performance metrics for the Swarms API infrastructure
      </p>
    </div>
  )
}
