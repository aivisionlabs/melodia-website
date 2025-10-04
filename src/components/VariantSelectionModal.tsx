import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Play, Music, Clock, Headphones } from 'lucide-react'

interface SongVariant {
  id: string
  audioUrl: string
  streamAudioUrl: string
  imageUrl: string
  prompt: string
  modelName: string
  title: string
  tags: string
  createTime: string
  duration: number
}

interface VariantSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  songTitle: string
  variants: SongVariant[]
  onSelectVariant: (variant: SongVariant, variantIndex: number) => void
}

export const VariantSelectionModal = ({
  isOpen,
  onClose,
  songTitle,
  variants,
  onSelectVariant
}: VariantSelectionModalProps) => {
  const [selectedVariant, setSelectedVariant] = useState<number>(0)

  if (!isOpen) return null

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayVariant = () => {
    const variant = variants[selectedVariant]
    if (variant) {
      onSelectVariant(variant, selectedVariant)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">{songTitle}</h2>
                <p className="text-yellow-100">Choose a variant to play</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Variants Grid */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants.map((variant, index) => (
              <Card
                key={variant.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedVariant === index
                    ? 'ring-2 ring-yellow-500 bg-yellow-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedVariant(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Variant Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Music className="h-8 w-8 text-white" />
                    </div>

                    {/* Variant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Variant {index + 1}
                        </span>
                        {selectedVariant === index && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(variant.duration)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Headphones className="h-4 w-4" />
                          <span className="truncate">{variant.modelName}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {variant.tags && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {variant.tags}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {variants.length} variant{variants.length !== 1 ? 's' : ''} available
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlayVariant}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Variant {selectedVariant + 1}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
