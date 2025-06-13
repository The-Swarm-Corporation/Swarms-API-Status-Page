import { Terminal, Github, ExternalLink, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiveIndicator } from "./live-indicator"

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Terminal className="h-8 w-8 text-red-600 mr-2" />
              <span className="text-xl font-bold">
                Swarms API <span className="text-red-600">Status</span>
              </span>
            </div>
            <LiveIndicator className="hidden md:flex" />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#overview" className="text-gray-300 hover:text-white transition-colors duration-200">
              Overview
            </a>
            <a href="#metrics" className="text-gray-300 hover:text-white transition-colors duration-200">
              Metrics
            </a>
            <a href="#endpoints" className="text-gray-300 hover:text-white transition-colors duration-200">
              Endpoints
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800" asChild>
              <a
                href="https://docs.swarms.world"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Docs</span>
              </a>
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800" asChild>
              <a
                href="https://swarms.world/platform/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Activity className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">API Keys</span>
              </a>
            </Button>

            <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800" asChild>
              <a
                href="https://github.com/The-Swarm-Corporation/Swarms-API"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Github className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
