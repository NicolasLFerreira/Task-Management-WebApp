"use client"

import { useState } from "react"
import { client } from "../../api-client/client.gen"
import { HealthService } from "api-client"

const ApiDebugger = () => {
  const [result, setResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setResult("")

    try {
      // Test a simple GET request to the health endpoint
      const data = (await HealthService.getApiHealth()).data;

      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error("API test error:", err)
      setError(`Connection error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold mb-4">API Connection Debugger</h2>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test API Connection
        </button>
      </div>

      {isLoading && <p>Testing connection...</p>}

      {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

      {result && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Response:</h3>
          <pre className="text-gray-100 bg-gray-700 p-3 rounded overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-4 text-sm">
        <p>Current API base URL: {client.getConfig().baseURL}</p>
      </div>
    </div>
  )
}

export default ApiDebugger
