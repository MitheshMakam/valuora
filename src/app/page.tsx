"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import InputSection from "@/components/InputSection";
import LoadingState from "@/components/LoadingState";
import ErrorBox from "@/components/ErrorBox";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = useCallback(async (targetUrl?: string) => {
    const analyzeUrl = (targetUrl || url).trim();
    if (!analyzeUrl) {
      setError("Please paste a product URL to analyze.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);
    setLoadingStep(1);

    const steps = [600, 900, 700, 500, 300];
    let stepIdx = 0;

    const stepTimer = setInterval(() => {
      stepIdx++;
      if (stepIdx < 5) setLoadingStep(stepIdx + 1);
      else clearInterval(stepTimer);
    }, steps[stepIdx] || 500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: analyzeUrl }),
      });

      clearInterval(stepTimer);
      setLoadingStep(5);

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error (${res.status})`);
      }

      await new Promise((r) => setTimeout(r, 300));
      setResult(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
      setLoadingStep(0);
    }
  }, [url]);

  return (
    <>
      <Header />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1120,
          margin: "0 auto",
          padding: "56px 20px 120px",
        }}
      >
        <HeroSection />
        <InputSection
          url={url}
          onChange={setUrl}
          onAnalyze={analyze}
          disabled={loading}
        />
        {error && <ErrorBox message={error} onDismiss={() => setError("")} />}
        {loading && <LoadingState step={loadingStep} />}
        {result && !loading && <ResultsDashboard data={result} />}
      </main>
    </>
  );
}
