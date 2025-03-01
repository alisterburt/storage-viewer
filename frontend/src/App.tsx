import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-xl font-bold">Filesystem Directory Size Viewer</h1>
      </header>
      
      <main className="flex-1 p-4 bg-background overflow-auto">
        <div className="max-w-6xl mx-auto bg-card rounded-lg shadow p-4">
          <div className="p-4 text-muted-foreground text-center">
            Directory content will be displayed here
          </div>
        </div>
      </main>
    </div>
  )
}

export default App