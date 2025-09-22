"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ChevronDown, Edit } from "lucide-react";
import { getCurrentUser } from "@/lib/user-actions";
import SongCreationLoadingScreen from "@/components/SongCreationLoadingScreen";
import SongOptionsDisplay from "@/components/SongOptionsDisplay";

type Step = 1 | 2 | 3 | 'loading' | 'song-options';

export default function CreateSongV2Page() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  const [requesterName, setRequesterName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState<string>("Birthday");
  const [customOccasion, setCustomOccasion] = useState("");
  const [languages, setLanguages] = useState<string>("English");
  const [story, setStory] = useState("");
  const [moods, setMoods] = useState<string[]>(["Sentimental"]);
  const [customMood, setCustomMood] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedStyle, setGeneratedStyle] = useState("");
  const [isMusicStyleExpanded, setIsMusicStyleExpanded] = useState(false);
  const [isEditingLyrics, setIsEditingLyrics] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState("");
  const [lyricsError, setLyricsError] = useState("");
  const [userEditInput, setUserEditInput] = useState("");
  const [isUpdatingLyrics, setIsUpdatingLyrics] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [songVariants, setSongVariants] = useState<any[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem("onboarding_complete");
      if (done !== "true") router.replace("/onboarding");
    }
  }, [router]);

  // Get current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        // If user is logged in, pre-fill the requester name
        if (user?.name && !requesterName) {
          setRequesterName(user.name);
        }
      } catch (error) {
        console.log("No user logged in or error getting user:", error);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const toggleMood = (m: string) => {
    if (m === "Other") {
      // If "Other" is already selected, deselect it and clear custom mood
      if (moods.includes("Other")) {
        setMoods((prev) => prev.filter((x) => x !== "Other"));
        setCustomMood("");
      } else {
        // Select "Other" and clear other moods
        setMoods(["Other"]);
        setCustomMood("");
      }
    } else {
      // For regular moods, remove "Other" if it's selected and toggle the mood
      setMoods((prev) => {
        const withoutOther = prev.filter((x) => x !== "Other");
        return withoutOther.includes(m)
          ? withoutOther.filter((x) => x !== m)
          : [...withoutOther, m];
      });
      // Clear custom mood when selecting regular moods
      if (!moods.includes(m)) {
        setCustomMood("");
      }
    }
  };

  const handleNext = () => {
    if (!recipientName.trim()) {
      setError("Please enter who this song is for.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleCreateLyrics = async () => {
    setShowReviewPopup(false);
    setIsGeneratingLyrics(true);
    setStep(3);

    try {
      // Step 1: Create song request in database
      const createRequestResponse = await fetch("/api/create-song-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requester_name: requesterName || currentUser?.name || "Anonymous",
          email: currentUser?.email || null,
          recipient_name: recipientName,
          recipient_relationship: occasion === "Other" ? customOccasion : occasion,
          languages: languages.split(",").map(lang => lang.trim()).filter(Boolean),
          additional_details: `${moods.includes("Other") && customMood ? customMood : moods.join(", ")} style song. ${story ? `Story: ${story}` : ""}`,
          delivery_preference: "email",
          user_id: currentUser?.id || null,
          // anonymous_user_id: typeof window !== "undefined" ? localStorage.getItem("anonymous_user_id") || undefined : undefined,
        }),
      });

      if (!createRequestResponse.ok) {
        throw new Error("Failed to create song request");
      }

      const createRequestData = await createRequestResponse.json();
      const newRequestId = createRequestData.requestId;
      setRequestId(newRequestId);

      // Step 2: Generate lyrics using the existing API with requestId for database storage
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_name: `${recipientName}, my ${occasion === "Other" ? customOccasion : occasion.toLowerCase()}`,
          languages: languages.split(",").map(lang => lang.trim()).filter(Boolean),
          additional_details: `${moods.includes("Other") && customMood ? customMood : moods.join(", ")} style song. ${story ? `Story: ${story}` : ""}`,
          requestId: newRequestId, // Add back for database storage
          userId: currentUser?.id || null,
          requester_name: requesterName || currentUser?.name || "Anonymous", // Pass requester name dynamically
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to generate lyrics");
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success && data.lyrics) {
        setGeneratedLyrics(data.lyrics);
        setEditedLyrics(data.lyrics); // Initialize edited lyrics with generated lyrics
        setGeneratedTitle(data.title || `${recipientName}'s Song`);
        setGeneratedStyle(data.styleOfMusic || "Personalized song style");
        setLyricsError(""); // Clear any previous errors
      } else {
        const errorMessage = data.error || "Failed to generate lyrics. Please try again.";
        setLyricsError(errorMessage);
        setGeneratedLyrics("");
        setEditedLyrics("");
        setGeneratedTitle("");
        setGeneratedStyle("");
      }
      setIsGeneratingLyrics(false);
    } catch (error) {
      console.error("Error generating lyrics:", error);
      const errorMessage = "Sorry, there was an error generating your lyrics. Please check your connection and try again.";
      setLyricsError(errorMessage);
      setGeneratedLyrics("");
      setEditedLyrics("");
      setGeneratedTitle("");
      setGeneratedStyle("");
      setIsGeneratingLyrics(false);
    }
  };

  const handleUpdateLyrics = async () => {
    if (!userEditInput.trim()) {
      alert("Please enter your changes in the text field below.");
      return;
    }

    if (!requestId) {
      alert("No request ID found. Please try generating lyrics again.");
      return;
    }

    setIsUpdatingLyrics(true);
    setLyricsError("");
    console.log("Starting lyrics update with requestId:", requestId, "and refineText:", userEditInput.trim());

    try {
      // Use the existing refine lyrics API with requestId
      const response = await fetch("/api/refine-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: requestId,
          refineText: userEditInput.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to update lyrics");
      }

      const data = await response.json();
      console.log("Updated lyrics response:", data);

      if (data.success && data.draft) {
        // The refine lyrics API returns a draft object with generated_text
        console.log("Successfully updated lyrics:", data.draft.generated_text);
        setGeneratedLyrics(data.draft.generated_text);
        setEditedLyrics(data.draft.generated_text);
        setGeneratedTitle(`${recipientName}'s Song`);
        setGeneratedStyle("Personalized song style");
        setUserEditInput(""); // Clear the input field
        setIsEditingLyrics(false); // Exit edit mode
        setLyricsError(""); // Clear any previous errors
        console.log("Lyrics updated successfully, cleared error state");
      } else {
        const errorMessage = data.error || "Failed to update lyrics. Please try again.";
        console.error("Failed to update lyrics:", errorMessage);
        setLyricsError(errorMessage);
      }
      setIsUpdatingLyrics(false);
    } catch (error) {
      console.error("Error updating lyrics:", error);
      const errorMessage = "Sorry, there was an error updating your lyrics. Please try again.";
      setLyricsError(errorMessage);
      setIsUpdatingLyrics(false);
    }
  };

  const handleCreateSong = async () => {
    if (!requestId || !editedLyrics) {
      alert("No request ID or lyrics found. Please try generating lyrics again.");
      return;
    }

    // Always show loading screen first
    setStep('loading');

    try {
      // Use the same approach as create-song-from-lyrics page
      // First, we need to approve the lyrics draft
      console.log('🎵 Fetching lyrics draft for requestId:', requestId);
      const drafts = await fetch(`/api/lyrics-display?requestId=${requestId}`);
      const draftsData = await drafts.json();
      console.log('🎵 Lyrics draft response:', draftsData);
      
      if (draftsData.success && draftsData.data && draftsData.data.lyricsDraft) {
        // Approve the current draft
        const approveResponse = await fetch("/api/approve-lyrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draftId: draftsData.data.lyricsDraft.id,
            requestId: requestId,
          }),
        });

        if (approveResponse.ok) {
          // Now create the song using the lyrics-actions approach
          const createResponse = await fetch("/api/create-song-from-lyrics", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requestId: requestId,
            }),
          });

          if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log("Song creation response:", createData);

            if (createData.success && createData.taskId) {
              setTaskId(createData.taskId);
            } else {
              console.log("Song creation failed, but showing loading screen anyway");
              setTaskId(null);
            }
          } else {
            console.log("Create song API failed, but showing loading screen anyway");
            setTaskId(null);
          }
        } else {
          console.log("Approve lyrics failed, but showing loading screen anyway");
          setTaskId(null);
        }
      } else {
        console.log("No lyrics draft found, but showing loading screen anyway");
        setTaskId(null);
      }
    } catch (error) {
      console.error("Error creating song:", error);
      // Even on error, show loading screen and then mock options
      console.log("Song creation error, but showing loading screen anyway");
      setTaskId(null);
    }
  };

  const handleLoadingComplete = () => {
    // After 45 seconds, always show song options screen
    // If API fails, show mock data
    if (taskId) {
      pollForSongVariants();
    } else {
      // If no taskId, show mock song options
      showMockSongOptions();
    }
  };

  const showLoadingSongOptions = () => {
    // Create loading song variants with placeholder data
    const baseTitle = generatedTitle || `${recipientName}'s Song`;
    
    const loadingVariants = [
      {
        id: 'loading_variant_1',
        title: `${baseTitle} - Version 1`,
        audioUrl: '', // Empty = loading
        imageUrl: 'https://picsum.photos/400/400?random=variant1',
        duration: 180,
        downloadStatus: 'Generating...',
        isLoading: true // No real audio URL = loading
      },
      {
        id: 'loading_variant_2', 
        title: `${baseTitle} - Version 2`,
        audioUrl: '', // Empty = loading
        imageUrl: 'https://picsum.photos/400/400?random=variant2',
        duration: 195,
        downloadStatus: 'Generating...',
        isLoading: true // No real audio URL = loading
      }
    ];
    
    setSongVariants(loadingVariants);
    setStep('song-options');
  };

  const showMockSongOptions = () => {
    // Create mock song variants using the actual generated title and lyrics
    const baseTitle = generatedTitle || `${recipientName}'s Song`;
    
    const mockVariants = [
      {
        id: 'mock_variant_1',
        title: `${baseTitle} - Version 1`,
        audioUrl: '/placeholder-audio.mp3',
        imageUrl: 'https://picsum.photos/400/400?random=variant1',
        duration: 180,
        downloadStatus: 'Download in 2 minutes',
        isLoading: true // Initially loading
      },
      {
        id: 'mock_variant_2', 
        title: `${baseTitle} - Version 2`,
        audioUrl: '/placeholder-audio.mp3',
        imageUrl: 'https://picsum.photos/400/400?random=variant2',
        duration: 195,
        downloadStatus: 'Download in 2 minutes',
        isLoading: true // Initially loading
      }
    ];
    
    setSongVariants(mockVariants);
    setStep('song-options');
    
    // Simulate loading completion after 3 seconds for demo
    setTimeout(() => {
      setSongVariants(prevVariants => 
        prevVariants.map(variant => ({
          ...variant,
          isLoading: false,
          downloadStatus: 'Download now'
        }))
      );
    }, 3000);
  };

  const pollForSongVariants = async () => {
    if (!taskId) {
      showMockSongOptions();
      return;
    }

    // Always show the song options screen first with loading state
    showLoadingSongOptions();

    // Start polling
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/song-status/${taskId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Song status response:', data);
          
          if (data.status === 'completed' && data.variants && data.variants.length >= 2) {
            // Convert Suno variants to our format
            const formattedVariants = data.variants.map((variant: any, index: number) => ({
              id: variant.id,
              title: variant.title || `${generatedTitle || `${recipientName}'s Song`} - Version ${index + 1}`,
              audioUrl: variant.audioUrl || variant.streamAudioUrl,
              imageUrl: variant.imageUrl,
              duration: variant.duration || 180,
              downloadStatus: "Download now",
              isLoading: false // Real audio URLs = not loading
            }));
            
            setSongVariants(formattedVariants);
            clearInterval(pollInterval); // Stop polling
          } else if (data.status === 'processing') {
            // Keep showing loading state, don't update variants
            console.log('Song still processing...');
          } else if (data.status === 'failed') {
            console.log('Song generation failed');
            clearInterval(pollInterval);
            // Show error state or fallback
            showMockSongOptions();
          }
        } else {
          console.log('API error during polling');
          clearInterval(pollInterval);
          showMockSongOptions();
        }
      } catch (error) {
        console.error("Error polling for song variants:", error);
        clearInterval(pollInterval);
        showMockSongOptions();
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  const handleSelectVariant = (variantId: string) => {
    console.log("Selected variant:", variantId);
    // Here you would typically save the selected variant and redirect
    // For now, just redirect to home
    router.push('/');
  };

  const handleBackupWithGoogle = () => {
    console.log("Backup with Google clicked");
    // Implement Google backup functionality
  };

  const handleSubmit = async () => {
    // Validate required fields
    setError(null);
    if (!requesterName.trim() || !recipientName.trim() || !languages.trim()) {
      setError("Please fill in all required fields (Your Name, To/For, and Languages).");
      return;
    }

    // Show review popup instead of submitting
    setShowReviewPopup(true);

    // setIsSubmitting(true);
    // try {
    //   const anonymousId =
    //     typeof window !== "undefined"
    //       ? localStorage.getItem("anonymous_user_id") || undefined
    //       : undefined;

    //   // 1) Create song request
    //   const createRes = await fetch("/api/create-song-request", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       requester_name: user?.name || "Anonymous",
    //       email: user?.email || null,
    //       recipient_name: recipientName,
    //       recipient_relationship:
    //         occasion === "Other" ? customOccasion || "friend" : occasion,
    //       languages: languages
    //         .split(",")
    //         .map((l) => l.trim())
    //         .filter(Boolean),
    //       additional_details:
    //         moods.includes("Other") && customMood.trim()
    //           ? `${story}${story ? " | " : ""}Mood: ${customMood}`
    //           : story,
    //       delivery_preference: "email",
    //       user_id: user?.id || null,
    //       anonymous_user_id: anonymousId,
    //     }),
    //   });

    //   if (!createRes.ok) throw new Error("Failed to create song request");
    //   const createData = await createRes.json();
    //   const requestId = createData.requestId;

    //   // 2) Generate lyrics (payment gating handled in API)
    //   const lyricsRes = await fetch("/api/generate-lyrics", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       recipient_name: recipientName,
    //       languages: languages
    //         .split(",")
    //         .map((l) => l.trim())
    //         .filter(Boolean),
    //       additional_details:
    //         moods.includes("Other") && customMood.trim()
    //           ? `${story}${story ? " | " : ""}Mood: ${customMood}`
    //           : story,
    //       requestId,
    //       userId: user?.id,
    //     }),
    //   });

    //   if (lyricsRes.status === 402) {
    //     router.replace("/"); // Home shows payment required modal
    //     return;
    //   }
    //   if (!lyricsRes.ok) throw new Error("Failed to generate lyrics");

    //   // 3) Redirect to lyrics display
    //   router.replace(`/lyrics-display?requestId=${requestId}`);
    // } catch (e) {
    //   setError(e instanceof Error ? e.message : "Something went wrong");
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  // Handle loading screen
  if (step === 'loading') {
    return (
      <SongCreationLoadingScreen 
        onComplete={handleLoadingComplete}
        duration={45}
      />
    );
  }

  // Handle song options display
  if (step === 'song-options') {
    return (
      <SongOptionsDisplay
        variants={songVariants}
        onBack={() => setStep(3)}
        onSelectVariant={handleSelectVariant}
        onBackupWithGoogle={handleBackupWithGoogle}
      />
    );
  }

  return (
    <div className={`min-h-screen ${showReviewPopup || step === 3 ? 'bg-melodia-yellow' : 'bg-melodia-cream'} text-melodia-teal flex flex-col font-body pt-16 pb-20`}>
      <div className="p-6 space-y-8 flex-grow">
        {step === 1 && (
          <div className="space-y-8">
            <header className="text-center">
              <h1 className="text-3xl font-bold font-heading text-melodia-teal">
                Create your song
              </h1>
              <p className="text-md text-melodia-teal/80 mt-1">
                Tell us a little bit about it.
              </p>
            </header>
            <div>
              <label
                className="block text-lg font-semibold text-melodia-teal mb-2"
                htmlFor="requester-name"
              >
                Your Name
              </label>
              <p className="text-sm text-melodia-teal opacity-70 mb-3">
                What should we call you?
              </p>
              <input
                id="requester-name"
                placeholder="Your name"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div>
              <label
                className="block text-lg font-semibold text-melodia-teal mb-2"
                htmlFor="to-for"
              >
                To / For
              </label>
              <p className="text-sm text-melodia-teal opacity-70 mb-3">
                Who is this song for?
              </p>
              <input
                id="to-for"
                placeholder="My best friend, Rohan"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-melodia-teal mb-3">
                Occasion
              </label>
              <div className="flex flex-wrap gap-3">
                {(["Birthday", "Anniversary", "Wedding", "Other"] as const).map(
                  (o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOccasion(o)}
                      className={`chip ${occasion === o ? "active" : ""}`}
                    >
                      {o}
                    </button>
                  )
                )}
              </div>
              {occasion === "Other" && (
                <div className="mt-4">
                  <input
                    placeholder="e.g., Graduation, Just because..."
                    value={customOccasion}
                    onChange={(e) => setCustomOccasion(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
              )}
            </div>
            <div>
              <label
                className="block text-lg font-semibold text-melodia-teal mb-2"
                htmlFor="language"
              >
                Language
              </label>
              <input
                id="language"
                placeholder="English"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="form-input w-full"
              />
              <p className="text-sm text-melodia-teal opacity-70 mt-2 px-1">
                Feel free to mix it up! e.g., Hindi + English, Punjabi
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <header className="text-center">
              <h1 className="text-3xl font-bold font-heading text-melodia-teal">
                Add your personal touch
              </h1>
              <p className="text-base text-gray-500">
                This step is optional, but it makes the song truly unique!
              </p>
            </header>
            <div>
              <label
                className="text-xl font-bold font-heading mb-2 block text-melodia-teal"
                htmlFor="song-story"
              >
                The Story Behind the Song{" "}
                <span className="font-normal text-gray-400 text-sm">
                  (Optional)
                </span>
              </label>
              <textarea
                id="song-story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Share a memory, an inside joke, or what makes them special."
                className="w-full min-h-40 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-melodia-yellow focus:border-transparent text-melodia-teal placeholder:text-gray-400 transition-all duration-200"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading mb-4 text-melodia-teal">
                The Vibe
              </h2>
              <h3 className="font-semibold text-lg mb-3 text-gray-600">Mood</h3>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    "Joyful",
                    "Sentimental",
                    "Upbeat & Fun",
                    "Romantic",
                    "Other",
                  ] as const
                ).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMood(m)}
                    className={`px-5 h-10 rounded-full border-2 transition-all duration-200 font-semibold text-sm ${moods.includes(m)
                      ? "bg-melodia-coral text-white border-[var(--accent-vibrant-coral)] shadow-lg shadow-coral-500/30"
                      : "bg-white text-melodia-teal border-gray-200 hover:bg-gray-50 hover:transform hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {moods.includes("Other") && (
                <div className="mt-4">
                  <input
                    placeholder="e.g., Melancholic, Energetic, Peaceful..."
                    value={customMood}
                    onChange={(e) => setCustomMood(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-melodia-teal hover:opacity-70 transition-opacity p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-melodia-teal">Your Lyrics</h1>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl p-6">
              {/* Generated Title */}
              <h2 className="text-xl font-bold text-melodia-teal text-center mb-4">
                {generatedTitle || `For ${recipientName}`}
              </h2>

              {/* Music Style Dropdown */}
              <div
                className="flex items-center justify-between py-3 border-b border-gray-200 mb-4 cursor-pointer"
                onClick={() => setIsMusicStyleExpanded(!isMusicStyleExpanded)}
              >
                <span className="text-melodia-teal font-medium">Music Style</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${isMusicStyleExpanded ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Music Style Content */}
              {isMusicStyleExpanded && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{generatedStyle}</p>
                </div>
              )}

              {/* Lyrics Content */}
              {isGeneratingLyrics || isUpdatingLyrics ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-melodia-coral mx-auto mb-4"></div>
                  <p className="text-melodia-teal">
                    {isGeneratingLyrics ? "Generating your lyrics..." : "Updating your lyrics..."}
                  </p>
                </div>
              ) : lyricsError ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Generation Failed</h3>
                  <p className="text-gray-600 mb-4">{lyricsError}</p>
                  <button
                    onClick={() => {
                      setLyricsError("");
                      handleCreateLyrics();
                    }}
                    className="px-6 py-2 bg-melodia-coral text-white rounded-full hover:bg-opacity-90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : editedLyrics ? (
                <div className="space-y-4">
                  <div className="bg-blue-100 p-2 rounded mb-2">
                    <p className="text-sm text-blue-800">📝 Lyrics loaded! Click Edit button below to modify.</p>
                  </div>
                  {editedLyrics.split('\n').map((line, index) => {
                    if (line.startsWith('[') && line.endsWith(']')) {
                      return (
                        <div key={index} className="font-semibold text-melodia-teal mt-6 mb-2">
                          {line}
                        </div>
                      );
                    }
                    return (
                      <p key={index} className="text-gray-600 leading-relaxed">
                        {line}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No lyrics generated yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Input Field - Show when in edit mode, outside the lyrics card */}
        {step === 3 && isEditingLyrics && editedLyrics && (
          <div className="mt-6">
            <div className="bg-white rounded-3xl p-6">
              <label className="block text-lg font-semibold text-melodia-teal mb-3">
                What changes would you like to make?
              </label>
              <textarea
                value={userEditInput}
                onChange={(e) => setUserEditInput(e.target.value)}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-melodia-coral focus:border-transparent"
                placeholder="Type your changes here... (e.g., 'Make it more romantic', 'Add more Hindi lyrics', 'Change the chorus')"
              />
              <p className="text-sm text-gray-500 mt-3">
                Your input will be added to the existing details and new lyrics will be generated.
              </p>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      {/* Bottom Action Bar - Only show on step 3 */}
      {step === 3 && !isGeneratingLyrics && !isUpdatingLyrics && (
        <div className="p-6 sticky bottom-0 bg-white pt-4 pb-6">
          {isEditingLyrics ? (
            <>
              <Button
                className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200 mb-3"
                onClick={handleUpdateLyrics}
                disabled={isUpdatingLyrics}
              >
                {isUpdatingLyrics ? "Updating Lyrics..." : "Submit Changes"}
              </Button>
              <button
                className="w-full text-melodia-teal font-semibold text-center py-2"
                onClick={() => {
                  setIsEditingLyrics(false);
                  setUserEditInput("");
                }}
              >
                Cancel
              </button>
            </>
          ) : editedLyrics ? (
            <>
              <Button
                className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200 mb-3"
                onClick={handleCreateSong}
              >
                Create Song
              </Button>
              <button
                className="w-full text-melodia-teal font-semibold text-center py-2"
                onClick={() => {
                  console.log("Edit clicked - current editedLyrics:", editedLyrics);
                  console.log("Setting isEditingLyrics to true");
                  setIsEditingLyrics(true);
                }}
              >
                Edit
              </button>
            </>
          ) : (
            <Button
              className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
              onClick={handleCreateLyrics}
            >
              Generate Lyrics
            </Button>
          )}
        </div>
      )}

      {step !== 3 && (
        <div className="p-6 sticky bottom-0 bg-white pt-4 pb-6">
          {step === 1 ? (
            <Button
              className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              className="w-full h-14 bg-melodia-yellow text-melodia-teal text-lg font-bold rounded-full shadow-lg shadow-yellow-500/30 hover:scale-105 transition-all duration-200"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Review inputs"}
            </Button>
          )}
        </div>
      )}

      {/* Review Popup Modal - Full Screen Design */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-melodia-yellow z-50 flex flex-col">
          {/* Back Button */}
          <div className="p-6 pt-16 bg-melodia-yellow">
            <button
              onClick={() => setShowReviewPopup(false)}
              className="flex items-center gap-2 text-melodia-teal hover:opacity-70 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Main Content Card */}
          <div className="flex-1 flex items-center justify-center p-6 bg-melodia-yellow">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
              {/* Sparkle Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-melodia-coral rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-melodia-teal mb-4">
                Review & Create Your Song
              </h1>

              {/* Summary Text */}
              <p className="text-melodia-teal text-base leading-relaxed mb-8">
                Okay <span className="font-bold">{requesterName || currentUser?.name || "there"}</span>! We're creating a <span className="font-bold">{moods.join(", ")}</span> song in{" "}
                <span className="font-bold">{languages}</span> for your{" "}
                <span className="font-bold">{recipientName}</span>, for your{" "}
                <span className="font-bold">{occasion === "Other" ? customOccasion : occasion}</span>.
                Ready to see the magic?
              </p>

              {/* Create Button */}
              <Button
                onClick={handleCreateLyrics}
                className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
              >
                Create My Lyrics
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
