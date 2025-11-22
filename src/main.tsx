import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { SparkModeProvider } from './lib/sparkContext.tsx'
import { bootstrapSparkRuntime } from './lib/sparkMock.ts'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

const root = createRoot(document.getElementById('root')!)

bootstrapSparkRuntime()
  .then((mode) => {
    root.render(
      <StrictMode>
        <SparkModeProvider mode={mode}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <App />
          </ErrorBoundary>
        </SparkModeProvider>
      </StrictMode>
    )
  })
  .catch((err) => {
    console.error('Failed to bootstrap Spark runtime; falling back to mock mode', err)
    root.render(
      <StrictMode>
        <SparkModeProvider mode="mock">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <App />
          </ErrorBoundary>
        </SparkModeProvider>
      </StrictMode>
    )
  })
