import { useToast as useNewToast } from "@/components/ui/toast"

// Re-export the new toast hook for backward compatibility
export const useToast = useNewToast

// Simple toast function for backward compatibility
export const toast = {
  success: (title: string, message?: string) => {
    console.log('Toast success:', title, message)
  },
  error: (title: string, message?: string) => {
    console.log('Toast error:', title, message)
  },
  warning: (title: string, message?: string) => {
    console.log('Toast warning:', title, message)
  },
  info: (title: string, message?: string) => {
    console.log('Toast info:', title, message)
  }
}