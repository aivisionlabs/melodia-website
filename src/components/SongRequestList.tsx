"use client";

import { useState } from "react";
import { SelectSongRequest, SelectUserSong, SelectSong } from "@/lib/db/schema";

interface SongRequestListProps {
  requests: Array<
    SelectSongRequest & { song?: SelectUserSong | SelectSong | null }
  >;
}

export default function SongRequestList({ requests }: SongRequestListProps) {
  const [currentRequests, setCurrentRequests] = useState(requests);
  const [markingAsCompleted, setMarkingAsCompleted] = useState<number | null>(
    null
  );
  const [cancellingRequest, setCancellingRequest] = useState<number | null>(
    null
  );

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "pending":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getSongStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkAsCompleted = async (requestId: number) => {
    if (markingAsCompleted === requestId) return;

    setMarkingAsCompleted(requestId);
    try {
      const response = await fetch(
        `/api/song-requests/${requestId}/mark-completed`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to mark request as completed");
      }

      // Update local state
      setCurrentRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status: "completed" } : req
        )
      );
    } catch (error) {
      console.error("Error marking request as completed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to mark request as completed. Please try again."
      );
    } finally {
      setMarkingAsCompleted(null);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (cancellingRequest === requestId) return;

    // Confirm cancellation
    if (
      !confirm(
        "Are you sure you want to cancel this request? This action cannot be undone."
      )
    ) {
      return;
    }

    setCancellingRequest(requestId);
    try {
      const response = await fetch(`/api/song-requests/${requestId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel request");
      }

      // Update local state
      setCurrentRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status: "cancelled" } : req
        )
      );
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to cancel request. Please try again."
      );
    } finally {
      setCancellingRequest(null);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (currentRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No song requests found
        </h3>
        <p className="text-gray-500">
          New song requests will appear here once submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {currentRequests.map((request) => (
          <li key={request.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status || "pending"}
                    </span>
                    {request.song && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSongStatusColor(
                          request.song.status
                        )}`}
                      >
                        Song: {request.song.status}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium text-gray-900 mb-1">
                    Request #{request.id}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Recipient:</span>{" "}
                      {request.recipient_details}
                    </div>
                    {request.requester_name && (
                      <div>
                        <span className="font-medium">Requester:</span>{" "}
                        {request.requester_name}
                      </div>
                    )}
                    {request.occasion && (
                      <div>
                        <span className="font-medium">Occasion:</span>{" "}
                        {request.occasion}
                      </div>
                    )}
                    {request.email && (
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {request.email}
                      </div>
                    )}
                    {request.mobile_number && (
                      <div>
                        <span className="font-medium">Mobile:</span>{" "}
                        {request.mobile_number}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Languages:</span>{" "}
                      {request.languages}
                    </div>
                    {request.mood && request.mood.length > 0 && (
                      <div>
                        <span className="font-medium">Mood:</span>{" "}
                        {request.mood.join(", ")}
                      </div>
                    )}
                    {request.song_story && (
                      <div className="mt-2">
                        <span className="font-medium">Story:</span>{" "}
                        <span className="text-gray-700">
                          {request.song_story.length > 200
                            ? `${request.song_story.substring(0, 200)}...`
                            : request.song_story}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {formatDate(request.created_at)}
                    </div>
                    {request.song && (
                      <div className="text-xs text-gray-500">
                        Song ID: {request.song.id} | Slug:{" "}
                        {"slug" in request.song ? request.song.slug : "N/A"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {request.status !== "completed" &&
                      request.status !== "cancelled" &&
                      request.song &&
                      request.song.status === "completed" && (
                        <button
                          onClick={() => handleMarkAsCompleted(request.id)}
                          disabled={markingAsCompleted === request.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {markingAsCompleted === request.id
                            ? "Marking..."
                            : "Mark as Completed"}
                        </button>
                      )}
                    {request.status !== "completed" &&
                      request.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          disabled={cancellingRequest === request.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingRequest === request.id
                            ? "Cancelling..."
                            : "Cancel Request"}
                        </button>
                      )}
                  </div>

                  {/* Status indicators */}
                  {request.status === "completed" && (
                    <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700">
                      ✓ Completed
                    </span>
                  )}
                  {request.status === "cancelled" && (
                    <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600">
                      ✗ Cancelled
                    </span>
                  )}
                  {request.status !== "completed" &&
                    request.status !== "cancelled" &&
                    !request.song && (
                      <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500">
                        No song created yet
                      </span>
                    )}
                  {request.status !== "completed" &&
                    request.status !== "cancelled" &&
                    request.song &&
                    request.song.status &&
                    request.song.status !== "completed" && (
                      <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-yellow-700">
                        Song in progress
                      </span>
                    )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
