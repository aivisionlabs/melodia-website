'use client';

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { PricingPlan, PricingPlansProps } from '@/types/payment';
import { formatAmount } from '@/lib/razorpay-client';

export const PricingPlans: React.FC<PricingPlansProps> = ({
  onSelectPlan,
  selectedPlanId,
  showDescription = true,
  compact = false,
}) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pricing-plans?active=true');
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans);
      } else {
        setError(data.message || 'Failed to fetch pricing plans');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: number) => {
    onSelectPlan(planId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPricingPlans}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No pricing plans available</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative bg-white rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg ${
            selectedPlanId === plan.id
              ? 'border-blue-500 ring-2 ring-blue-200'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {selectedPlanId === plan.id && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Selected
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatAmount(plan.price, plan.currency)}
            </div>
            {showDescription && (
              <p className="text-gray-600 text-sm">{plan.description}</p>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {plan.features && (
              <>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {plan.features.songs === -1 ? 'Unlimited' : plan.features.songs} songs
                  </span>
                </div>
                {plan.features.lyrics_generation && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">AI lyrics generation</span>
                  </div>
                )}
                {plan.features.music_generation && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">AI music generation</span>
                  </div>
                )}
                {plan.features.download && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Download songs</span>
                  </div>
                )}
                {plan.features.sharing && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Share songs</span>
                  </div>
                )}
                {plan.features.priority_support && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Priority support</span>
                  </div>
                )}
                {plan.features.custom_styles && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Custom music styles</span>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => handlePlanSelect(plan.id)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              selectedPlanId === plan.id
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {selectedPlanId === plan.id ? 'Selected' : 'Select Plan'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PricingPlans;
