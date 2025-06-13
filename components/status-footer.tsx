import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StatusFooter() {
  return (
    <footer className="mt-16 py-8 border-t border-gray-800">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <p className="text-gray-400">Submit fixes and improvements to the Swarms API</p>
        </div>
        <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
          <Github className="mr-2 h-4 w-4" />
          <a href="https://github.com/The-Swarm-Corporation/Swarms-API" target="_blank" rel="noopener noreferrer">
            GitHub Repository
          </a>
        </Button>
      </div>
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} The Swarm Corporation. All rights reserved.</p>
        <p className="mt-1">
          <a href="https://docs.swarms.world" className="hover:text-gray-400 underline">
            Documentation
          </a>{" "}
          |
          <a href="https://swarms.world/platform/api-keys" className="hover:text-gray-400 underline ml-2">
            API Keys
          </a>
        </p>
      </div>
    </footer>
  )
}
