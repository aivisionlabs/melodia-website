"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { SongRequestFormData } from "@/types";
// Removed unused imports: getUserSongs, getUserSongRequests
import { fetchLyricsDisplayData } from "@/lib/lyrics-display-client";
// import { generateLyrics } from '@/lib/llm-integration' // No longer needed - using API directly
import {
  Music,
  Play,
  Edit3,
  Save,
  Loader2,
  ChevronRight,
  X,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { MediaPlayer } from "@/components/MediaPlayer";
import PaymentModal from "@/components/PaymentModal";
import PaymentRequired from "@/components/PaymentRequired";
import { isPaymentEnabled } from "@/lib/payment-config";
import Footer from "@/components/Footer";

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  // Form state for new song creation
  const [formData, setFormData] = useState<SongRequestFormData>({
    requester_name: "",
    phone_number: "",
    email: "",
    delivery_preference: undefined,
    recipient_name: "",
    recipient_relationship: "",
    languages: [],
    person_description: "",
    song_type: "",
    emotions: [],
    additional_details: "",
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [songLyrics, setSongLyrics] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lyrics display state for same-page display
  const [showLyrics, setShowLyrics] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState<any>(null);
  const [lyricsRequestId, setLyricsRequestId] = useState<number | null>(null);
  const [isEditingStyle, setIsEditingStyle] = useState(false);
  const [editedStyle, setEditedStyle] = useState("");
  const [modificationRequest, setModificationRequest] = useState("");
  const [isModifyingLyrics, setIsModifyingLyrics] = useState(false);
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentRequired, setShowPaymentRequired] = useState(false);
  const [pendingSongRequest, setPendingSongRequest] = useState<any>(null);

  // Real songs data for display
  const staticSongs = [
    {
      id: 1,
      title: "Ruchi My Queen",
      genre: "Hip Hop, Rap, Urban",
      duration: "2:59",
      audio: "/audio/ruchi-my-queen.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/ruchi-my-queen.json",
    },
    {
      id: 2,
      title: "Kaleidoscope Heart",
      genre: "Romantic, Acoustic, Ballad",
      duration: "3:09",
      audio: "/audio/kaleidoscope.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/kaleidoscope-heart.json",
    },
    {
      id: 3,
      title: "Same Office, Different Hearts",
      genre: "Love Story",
      duration: "3:15",
      audio: "/audio/office-love.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/same-office-different-hearts.json",
    },
    {
      id: 4,
      title: "A Kid's Night Musical",
      genre: "Musical",
      duration: "3:01",
      audio: "/audio/kids-musical.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/kids-night-musical.json",
    },
    {
      id: 5,
      title: "Lipsa Birthday Song",
      genre: "Birthday, Celebration, Party",
      duration: "3:01",
      audio: "/audio/birthday-queen.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/lipsa-birthday-song.json",
    },
    {
      id: 6,
      title: "Nirvan's Birthday Song",
      genre: "Birthday Party",
      duration: "1:53",
      audio: "/audio/nirvan-birthday.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/nirvan-birthday-song.json",
    },
    {
      id: 7,
      title: "Ram and Akanksha's Wedding Anthem",
      genre: "Wedding",
      duration: "3:00",
      audio: "/audio/wedding-anthem.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/ram-akanksha-wedding-anthem.json",
    },
    {
      id: 8,
      title: "Har Lamha Naya",
      genre: "Romantic",
      duration: "2:45",
      audio: "/audio/har-lamha-naya.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/har-lamha-naya.json",
    },
    {
      id: 9,
      title: "Jassi Di Jaan",
      genre: "Punjabi, Celebration",
      duration: "2:30",
      audio: "/audio/jassi-di-jaan.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/jassi-di-jaan.json",
    },
    {
      id: 10,
      title: "Sweet Dreams Tonight",
      genre: "Lullaby",
      duration: "2:15",
      audio: "/audio/sweet-dreams-tonight.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/sweet-dreams-tonight.json",
    },
  ];

  // Load lyrics when song is selected
  useEffect(() => {
    if (selectedSong && selectedSong.lyrics) {
      const loadLyrics = async () => {
        try {
          const response = await fetch(selectedSong.lyrics);
          const lyrics = await response.json();
          setSongLyrics(lyrics);
        } catch (error) {
          console.error("Error loading lyrics:", error);
          setSongLyrics([]);
        }
      };
      loadLyrics();
    }
  }, [selectedSong]);

  // Pre-fill user data if available and restore pending form data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        requester_name: user.name || "",
        email: user.email || "",
      }));

      // Check if there's pending form data from before login
      const pendingFormData = sessionStorage.getItem("pendingLyricsForm");
      if (pendingFormData) {
        try {
          const parsedData = JSON.parse(pendingFormData);
          setFormData((prev) => ({
            ...prev,
            ...parsedData,
            requester_name: user.name || parsedData.recipient_name || "",
            email: user.email || parsedData.email || "",
          }));

          // Clear the pending form data
          sessionStorage.removeItem("pendingLyricsForm");

          // Show success message
          addToast({
            type: "success",
            title: "Welcome back!",
            message:
              "Your form has been restored. You can now create your lyrics!",
          });
        } catch (error) {
          console.error("Error parsing pending form data:", error);
          sessionStorage.removeItem("pendingLyricsForm");
        }
      }
    }
  }, [user, addToast]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Check for name + relation format
    if (!formData.recipient_name.trim()) {
      errors.recipient_name = "Who is this song for? (Required)";
    } else if (formData.recipient_name.length < 3) {
      errors.recipient_name = "Name must be at least 3 characters";
    } else if (!formData.recipient_name.includes(",")) {
      errors.recipient_name =
        'Please include relation (e.g., "Sonu, my friend")';
    }

    // Check for proper language
    if (!formData.languages || formData.languages.length === 0) {
      errors.languages = "Please enter a language";
    } else {
      const validLanguages = [
        "hindi",
        "english",
        "punjabi",
        "bengali",
        "tamil",
        "telugu",
        "gujarati",
        "marathi",
        "kannada",
        "malayalam",
        "odia",
        "assamese",
        "urdu",
        "sanskrit",
      ];
      const hasValidLanguage = formData.languages.some((lang) =>
        validLanguages.some((valid) => lang.toLowerCase().includes(valid))
      );
      if (!hasValidLanguage) {
        errors.languages =
          "Please enter a valid language (e.g., Hindi, English, Punjabi)";
      }
    }

    if (!formData.additional_details?.trim()) {
      errors.additional_details = "Please tell us more about the song";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof SongRequestFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear general error when user makes changes
    if (error) {
      setError(null);
    }

    // Clear any previous state when user makes changes
  };

  const isFormValid = (): boolean => {
    const hasRecipientName = formData.recipient_name.trim().length >= 3;
    const hasLanguage = formData.languages && formData.languages.length > 0;
    const hasAdditionalDetails =
      (formData.additional_details?.trim().length || 0) > 0;

    return hasRecipientName && hasLanguage && hasAdditionalDetails;
  };

  const handlePlaySong = (song: any) => {
    setSelectedSong(song);
  };

  const scrollToLast = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Payment handlers
  const handlePaymentRequired = () => {
    setShowPaymentRequired(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);

    if (pendingSongRequest) {
      // Now try to generate lyrics again with payment completed
      try {
        const lyricsResponse = await fetch("/api/generate-lyrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient_name: pendingSongRequest.formData.recipient_name,
            languages: pendingSongRequest.formData.languages,
            additional_details:
              pendingSongRequest.formData.additional_details || "",
            requestId: pendingSongRequest.requestId,
            userId: user?.id,
          }),
        });

        if (lyricsResponse.ok) {
          await lyricsResponse.json();

          addToast({
            type: "success",
            title: "Payment Successful!",
            message: "Your personalized lyrics have been created successfully!",
          });

          // Redirect to lyrics display page
          router.push(
            `/lyrics-display?requestId=${pendingSongRequest.requestId}`
          );
        } else {
          throw new Error("Failed to generate lyrics after payment");
        }
      } catch (error) {
        addToast({
          type: "error",
          title: error instanceof Error ? error.message : "Error",
          message:
            "Payment successful but failed to generate lyrics. Please try again.",
        });
      }
    }

    setPendingSongRequest(null);
  };

  const handlePaymentError = (error: string) => {
    addToast({
      type: "error",
      title: "Payment Failed",
      message: error,
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setShowPaymentRequired(false);
    setPendingSongRequest(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if user is authenticated first
    if (!isAuthenticated) {
      // Store form data in session storage for after login
      sessionStorage.setItem("pendingLyricsForm", JSON.stringify(formData));

      // Show message and redirect to login
      addToast({
        type: "info",
        title: "Login Required",
        message: "Please log in to create your personalized lyrics!",
      });

      router.push("/sign-in");
      return;
    }

    // Check if payment is enabled
    if (!isPaymentEnabled()) {
      addToast({
        type: "info",
        title: "Payment Disabled",
        message:
          "Payment is currently disabled. You can create songs for free!",
      });
    }

    if (!validateForm()) {
      // Show specific validation errors instead of generic message
      const errors = Object.values(validationErrors).filter((error) => error);
      if (errors.length > 0) {
        setError(errors[0]); // Show first error
      } else {
        setError("Please fill in all required fields to continue.");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug: Log form data before sending
      console.log("Form data being sent:", {
        recipient_name: formData.recipient_name,
        languages: formData.languages,
        additional_details: formData.additional_details,
      });

      // Step 1: Create song request first (without payment)
      const songRequestResponse = await fetch("/api/create-song-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requester_name: user?.name || "Anonymous",
          email: user?.email || null,
          recipient_name: formData.recipient_name,
          recipient_relationship: "friend", // Default value
          languages: formData.languages,
          additional_details: formData.additional_details || "",
          delivery_preference: "email",
          user_id: user?.id || null,
          anonymous_user_id:
            typeof window !== "undefined"
              ? localStorage.getItem("anonymous_user_id") || undefined
              : undefined,
        }),
      });

      if (!songRequestResponse.ok) {
        throw new Error("Failed to create song request");
      }

      const songRequestResult = await songRequestResponse.json();

      if (songRequestResult.error) {
        throw new Error(songRequestResult.error);
      }

      const requestId = songRequestResult.requestId;

      // Step 2: Try to generate lyrics (this will check payment status)
      const lyricsResponse = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_name: formData.recipient_name,
          languages: formData.languages,
          additional_details: formData.additional_details || "",
          requestId: requestId,
          userId: user?.id,
        }),
      });

      if (lyricsResponse.status === 402) {
        // Payment required
        setPendingSongRequest({ requestId, formData });
        setShowPaymentRequired(true);
        return;
      }

      if (!lyricsResponse.ok) {
        const errorResult = await lyricsResponse.json();
        const errorMessage =
          errorResult.message || "Failed to generate lyrics. Please try again.";

        setError(errorMessage);
        addToast({
          type: "error",
          title: "Lyrics Generation Failed",
          message: errorMessage,
        });
        return;
      }

      const lyricsResult = await lyricsResponse.json();

      if (lyricsResult.error) {
        // Show specific error message in the form
        const errorMessage =
          lyricsResult.message ||
          "Failed to generate lyrics. Please try again.";
        const suggestion = lyricsResult.example
          ? `Suggestion: ${lyricsResult.example}`
          : "";

        setError(`${errorMessage} ${suggestion}`);
        addToast({
          type: "error",
          title: "Lyrics Generation Failed",
          message: errorMessage,
        });
        return;
      }

      // Step 3: Store the generated lyrics in the database
      const storeResponse = await fetch("/api/store-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: requestId,
          lyrics: lyricsResult.lyrics,
          recipient_name: formData.recipient_name,
          languages: formData.languages,
          additional_details: formData.additional_details || "",
        }),
      });

      if (!storeResponse.ok) {
        // If storing fails, we still have the song request, but no lyrics
        // This is better than having no song request at all
        console.error("Failed to store lyrics, but song request was created");
      }

      addToast({
        type: "success",
        title: "Lyrics Generated!",
        message: "Your personalized lyrics have been created successfully!",
      });

      // Load lyrics data and show on same page instead of redirecting
      try {
        const lyricsData = await fetchLyricsDisplayData(requestId);
        if (lyricsData) {
          setGeneratedLyrics({
            title: `Song for ${formData.recipient_name}`,
            styleOfMusic: "Personal",
            lyrics:
              lyricsData.lyricsDraft.edited_text ||
              lyricsData.lyricsDraft.generated_text,
          });
          setEditedStyle("Personal");
          setLyricsRequestId(requestId);
          setShowLyrics(true);

          // Scroll to lyrics section
          setTimeout(() => {
            const lyricsSection = document.getElementById("lyrics-section");
            if (lyricsSection) {
              lyricsSection.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error loading lyrics data:", error);
        // Fallback to redirect if loading fails
        router.push(`/lyrics-display?requestId=${requestId}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate lyrics. Please try again.";
      setError(errorMessage);
      addToast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lyrics editing functions
  const handleEditStyle = () => {
    setIsEditingStyle(true);
  };

  const handleCancelEdit = () => {
    setIsEditingStyle(false);
    setEditedStyle(generatedLyrics?.styleOfMusic || "");
  };

  const handleSaveStyle = () => {
    if (generatedLyrics) {
      setGeneratedLyrics({
        ...generatedLyrics,
        styleOfMusic: editedStyle,
      });
      setIsEditingStyle(false);
    }
  };

  const handleGenerateNewLyrics = async () => {
    if (!formData || !generatedLyrics) return;

    setIsModifyingLyrics(true);

    try {
      const additionalContext = modificationRequest.trim()
        ? `${formData.additional_details}. Style: ${generatedLyrics.styleOfMusic}. Modification request: ${modificationRequest}`
        : `${formData.additional_details}. Style: ${generatedLyrics.styleOfMusic}`;

      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_name: formData.recipient_name,
          languages: formData.languages,
          additional_details: additionalContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate new lyrics");
      }

      const lyricsResult = await response.json();

      if (lyricsResult.error) {
        addToast({
          type: "error",
          title: "Error",
          message: lyricsResult.message || "Failed to generate new lyrics",
        });
        return;
      }

      setGeneratedLyrics({
        ...generatedLyrics,
        lyrics: lyricsResult.lyrics || generatedLyrics.lyrics,
      });

      setModificationRequest("");

      addToast({
        type: "success",
        title: "New Lyrics Generated!",
        message: "Your lyrics have been updated successfully!",
      });
    } catch (error) {
      console.error("Error generating new lyrics:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to generate new lyrics. Please try again.",
      });
    } finally {
      setIsModifyingLyrics(false);
    }
  };

  const handleGenerateSong = async () => {
    if (!generatedLyrics || !formData) return;

    setIsGeneratingSong(true);

    try {
      const response = await fetch("/api/generate-song", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: generatedLyrics.title,
          lyrics: generatedLyrics.lyrics,
          style: generatedLyrics.styleOfMusic,
          recipient_name: formData.recipient_name,
          requestId: lyricsRequestId,
          userId: user?.id,
        }),
      });

      if (response.status === 402) {
        addToast({
          type: "error",
          title: "Payment Required",
          message: "Please complete payment to generate your song.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to generate song");
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.message || "Failed to generate song");
      }

      addToast({
        type: "success",
        title: "Song Generation Started",
        message:
          "Your personalized song is being generated. This may take a few minutes.",
      });
    } catch (error) {
      console.error("Error generating song:", error);
      addToast({
        type: "error",
        title: "Generation Failed",
        message:
          error instanceof Error ? error.message : "Failed to generate song",
      });
    } finally {
      setIsGeneratingSong(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-melodia-cream via-background to-melodia-cream relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 px-4 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6 shadow-glow animate-pulse">
            <Music className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
            Create Personalized Songs for loved ones in seconds
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            <span className="text-primary font-semibold bg-primary/10 px-2 py-1 rounded-lg">
              Share your story and we will create a Melodious song for you:
            </span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground/80">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">
              Your song is completely private to you
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Main Content Area - Two Column Layout */}
        <div className="max-w-6xl mx-auto mb-8 md:mb-16">
          <div className="bg-gradient-to-br from-melodia-cream via-background to-melodia-cream border-2 border-primary/20 rounded-xl p-4 md:p-8 shadow-elegant hover:shadow-glow transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Left Section - Form */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                    <Music className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold font-heading text-primary">
                    Create Your Song
                  </h2>
                  <div className="ml-auto flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Who is this song for? */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="recipient_name"
                      className="text-foreground font-medium font-body text-sm md:text-base flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      Who is this song for?
                    </Label>
                    <Input
                      id="recipient_name"
                      value={formData.recipient_name}
                      onChange={(e) =>
                        handleInputChange("recipient_name", e.target.value)
                      }
                      placeholder="e.g., Sonu, my friend"
                      className="h-12 md:h-14 bg-input border-2 border-melodia-teal-medium text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow text-sm md:text-base transition-all duration-200"
                    />
                    {validationErrors.recipient_name && (
                      <p className="text-red-500 text-xs md:text-sm">
                        {validationErrors.recipient_name}
                      </p>
                    )}
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="languages"
                      className="text-foreground font-medium font-body text-sm md:text-base flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Language
                    </Label>
                    <Input
                      id="languages"
                      value={formData.languages?.join(", ") || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "languages",
                          e.target.value
                            .split(",")
                            .map((l) => l.trim())
                            .filter((l) => l)
                        )
                      }
                      placeholder="Hindi, English, Punjabi, etc."
                      className="h-12 md:h-14 bg-input border-2 border-melodia-teal-medium text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow text-sm md:text-base transition-all duration-200"
                    />
                    <p className="text-muted-foreground text-xs md:text-sm font-body">
                      Type a valid language (Hindi, English, Punjabi, etc.)
                    </p>
                    {validationErrors.languages && (
                      <p className="text-red-500 text-xs md:text-sm">
                        {validationErrors.languages}
                      </p>
                    )}
                  </div>

                  {/* Tell us more about the song */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="additional_details"
                      className="text-foreground font-medium font-body text-sm md:text-base flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      Tell us more about the song
                    </Label>
                    <textarea
                      id="additional_details"
                      value={formData.additional_details}
                      onChange={(e) =>
                        handleInputChange("additional_details", e.target.value)
                      }
                      placeholder="Basic details about who the song is for, their story, genre, style preferences..."
                      className="w-full h-24 md:h-32 p-3 md:p-4 bg-input border-2 border-melodia-teal-medium rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow resize-none text-sm md:text-base font-body transition-all duration-200"
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground text-xs md:text-sm font-body">
                        Share the story, genre, and style you want
                      </p>
                      <p className="text-muted-foreground text-xs md:text-sm font-body">
                        {(formData.additional_details || "").length}/
                        <span className="text-accent font-semibold">1000</span>
                      </p>
                    </div>
                    {validationErrors.additional_details && (
                      <p className="text-red-500 text-xs md:text-sm">
                        {validationErrors.additional_details}
                      </p>
                    )}
                  </div>

                  {/* Hidden fields for form compatibility */}
                  <input
                    type="hidden"
                    name="recipient_relationship"
                    value={formData.recipient_relationship || "friend"}
                  />
                  <input
                    type="hidden"
                    name="person_description"
                    value={formData.person_description || ""}
                  />
                  <input
                    type="hidden"
                    name="song_type"
                    value={formData.song_type || ""}
                  />

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-xl">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-200">
                            Error
                          </h3>
                          <div className="mt-2 text-sm text-red-300">
                            {error}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <div className="flex flex-col items-center gap-4">
                      <Button
                        type="submit"
                        disabled={!isFormValid() || isSubmitting}
                        className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground font-bold font-body px-8 md:px-12 py-3 md:py-4 text-base md:text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto shadow-glow hover:shadow-coral-glow transform hover:scale-105 transition-all duration-200 border-2 border-primary/20 hover:border-primary/40"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-primary-foreground mr-2 md:mr-3"></div>
                            Generating Lyrics...
                          </div>
                        ) : !isAuthenticated ? (
                          "Login to Create Lyrics"
                        ) : (
                          "Create Lyrics"
                        )}
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        <span>Powered by AI</span>
                        <div className="w-1 h-1 bg-accent rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Section - Video Placeholder */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center shadow-coral">
                    <Play className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold font-heading text-accent">
                    How to Make a Song
                  </h2>
                  <div className="ml-auto flex gap-1">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                </div>

                {/* Video Placeholder with Dashed Border */}
                <div className="relative bg-gradient-to-br from-melodia-cream to-background rounded-xl border-2 border-dashed border-accent p-8 md:p-12 min-h-[300px] md:min-h-[400px] flex items-center justify-center shadow-elegant hover:shadow-glow transition-all duration-300">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center shadow-coral mx-auto animate-pulse">
                      <Play className="h-10 w-10 text-accent-foreground ml-1" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-accent">
                        Watch Our Tutorial
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Learn how to create personalized songs in just a few
                        simple steps
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                      <span>Video Coming Soon</span>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lyrics Display Section - Shows after lyrics are generated */}
        {showLyrics && generatedLyrics && (
          <div
            className="max-w-4xl mx-auto mb-8 md:mb-16 px-4"
            id="lyrics-section"
          >
            <div className="bg-gradient-to-br from-melodia-cream via-background to-melodia-cream border-2 border-accent/30 rounded-xl p-4 md:p-8 shadow-elegant hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center shadow-coral">
                  <Music className="h-5 w-5 text-accent-foreground" />
                </div>
                <h2 className="text-xl font-semibold font-heading text-accent">
                  Generated Lyrics
                </h2>
                <div className="ml-auto flex gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              </div>

              {/* Lyrics Content */}
              <div className="space-y-6">
                {/* Song Title */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {generatedLyrics.title}
                  </h3>
                </div>

                {/* Music Style Section - Editable */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-muted-foreground font-medium text-sm">
                      Music Style
                    </label>
                    {!isEditingStyle ? (
                      <Button
                        onClick={handleEditStyle}
                        size="sm"
                        variant="outline"
                        className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground h-8 px-3 font-semibold shadow-coral hover:shadow-glow transform hover:scale-105 transition-all duration-200"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit Style
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveStyle}
                          size="sm"
                          className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 px-3 font-semibold shadow-coral hover:shadow-glow transform hover:scale-105 transition-all duration-200"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                          className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground h-8 px-3 font-semibold shadow-coral hover:shadow-glow transform hover:scale-105 transition-all duration-200"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditingStyle ? (
                    <Input
                      value={editedStyle}
                      onChange={(e) => setEditedStyle(e.target.value)}
                      className="bg-input border-melodia-teal-medium text-foreground placeholder-muted-foreground"
                      placeholder="Enter music style..."
                    />
                  ) : (
                    <div className="bg-input rounded-lg p-4 border border-melodia-teal-medium">
                      <p className="text-muted-foreground text-lg">
                        {generatedLyrics.styleOfMusic}
                      </p>
                    </div>
                  )}
                </div>

                {/* Lyrics Section - Scrollable */}
                <div>
                  <label className="text-muted-foreground font-medium text-sm mb-2 block">
                    Lyrics
                  </label>
                  <div className="bg-secondary rounded-xl p-4 border border-melodia-teal-medium max-h-64 overflow-y-auto">
                    <pre className="text-foreground text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {generatedLyrics.lyrics}
                    </pre>
                  </div>
                </div>

                {/* Lyrics Modification Section */}
                <div className="bg-secondary rounded-lg p-4 border border-melodia-teal-medium">
                  <label className="text-muted-foreground font-medium text-sm mb-2 block">
                    What you want to modify in the current lyrics?
                  </label>
                  <textarea
                    value={modificationRequest}
                    onChange={(e) => setModificationRequest(e.target.value)}
                    className="w-full h-20 p-3 bg-secondary border border-melodia-teal-medium rounded-lg text-foreground placeholder-muted-foreground resize-none text-sm"
                    placeholder="e.g., Make it more romantic, change the chorus, add more verses, make it shorter..."
                  />
                  <Button
                    onClick={handleGenerateNewLyrics}
                    disabled={isModifyingLyrics}
                    className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 text-base rounded-lg shadow-coral hover:shadow-glow transform hover:scale-105 transition-all duration-200 border-2 border-accent/20 hover:border-accent/40"
                  >
                    {isModifyingLyrics ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                        Generating new lyrics...
                      </>
                    ) : (
                      "Generate new lyrics"
                    )}
                  </Button>
                </div>

                {/* Generate Song Button */}
                <Button
                  onClick={handleGenerateSong}
                  disabled={isGeneratingSong}
                  className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground font-bold py-4 text-lg rounded-xl shadow-glow hover:shadow-coral-glow transform hover:scale-105 transition-all duration-200 border-2 border-primary/20 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGeneratingSong ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Song...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Generate Song
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Popular Songs Gallery Section */}
        <div className="mb-8 md:mb-16 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6 text-center">
            Popular Songs
          </h2>
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide"
            >
              {staticSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-48 md:w-64 bg-card border border-melodia-teal-medium rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer group shadow-elegant hover:shadow-glow"
                >
                  <div className="relative">
                    <Image
                      src={song.image}
                      alt={song.title}
                      width={256}
                      height={192}
                      className="w-full h-36 md:h-48 object-cover"
                    />
                    <div className="absolute top-2 md:top-4 right-2 md:right-4">
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary hover:bg-gradient-primary/90 rounded-full flex items-center justify-center transition-colors duration-200 shadow-glow"
                      >
                        <Play className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-foreground font-semibold text-base md:text-lg mb-1">
                      {song.title}
                    </h3>
                    <p className="text-foreground text-xs md:text-sm mb-1">
                      {song.genre}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {song.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:block">
              <button
                onClick={scrollToLast}
                className="w-8 h-16 bg-muted hover:bg-melodia-teal-light rounded-l-lg flex items-center justify-center transition-colors duration-200"
              >
                <ChevronRight className="h-6 w-6 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-8 md:mb-16 px-4">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-4 shadow-glow animate-pulse">
              <Music className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Over 8,000 Stories Turned Into Songs
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              watch real reactions, see how our songs touch hearts
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* Testimonial 1 */}
            <div className="relative bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-shadow duration-300 border-2 border-transparent hover:border-melodia-teal-medium">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-purple-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-90 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">
                      Couple&apos;s Love Story
                    </p>
                    <p className="text-xs text-gray-600">
                      Wedding Anniversary Song
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="relative bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-shadow duration-300 border-2 border-transparent hover:border-melodia-teal-medium">
              <div className="aspect-video bg-gradient-to-br from-yellow-100 to-orange-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-orange-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-90 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">
                      Birthday Surprise
                    </p>
                    <p className="text-xs text-gray-600">
                      Special Celebration Song
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="relative bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-shadow duration-300 border-2 border-transparent hover:border-melodia-teal-medium">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-green-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-90 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">
                      Family Memories
                    </p>
                    <p className="text-xs text-gray-600">
                      Generational Love Song
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-300 text-sm md:text-base mb-4">
              Watch how it works - and the emotions it creates.
            </p>
            <Button
              onClick={scrollToTop}
              className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-xl shadow-glow hover:shadow-coral-glow"
            >
              I WANT TO CREATE ONE TOO
            </Button>
          </div>
        </div>
      </main>

      {/* MediaPlayer Modal */}
      {selectedSong && (
        <MediaPlayer
          song={{
            title: selectedSong.title,
            artist: selectedSong.genre,
            song_url: selectedSong.audio,
            slug: selectedSong.title.toLowerCase().replace(/\s+/g, "-"),
            lyrics: songLyrics,
          }}
          onClose={() => setSelectedSong(null)}
        />
      )}

      {/* Payment Required Modal */}
      {showPaymentRequired && pendingSongRequest && (
        <PaymentRequired
          onProceedToPayment={handlePaymentRequired}
          onCancel={handlePaymentCancel}
          planName="Basic Plan"
          amount={99}
          currency="INR"
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && pendingSongRequest && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentCancel}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          songRequestId={pendingSongRequest.requestId}
          planId={1}
          amount={99}
          currency="INR"
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
