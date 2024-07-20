"use client";
import axios, { isAxiosError } from "axios";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { ApiResponse, Section } from "@/lib/types";

const DocScraperUI = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrapedData, setScrapedData] = useState<ApiResponse | null>();

  const submithandler = async () => {
    setIsLoading(true);
    setError("");
    // setScrapedData(null);

    try {
      const { data } = await axios.post<Promise<ApiResponse>>("/api/scraper", {
        url,
      });
      if (data) {
        // @ts-ignore
        setScrapedData(data.data);
        setIsLoading(false);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        setIsLoading(false);
        setError(
          error.response?.data.message || "An error occurred while scraping"
        );
        return;
      }
      setError("Some Thing want worng");
    }
  };

  return (
    <div className="container mx-auto p-4  text-white">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Documentation Scraper</CardTitle>
          <CardDescription>
            Enter a URL to scrape documentation structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="https://docs.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={submithandler} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Scrape"
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scrapedData && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Scraped Structure:</h3>
              <Accordion type="single" collapsible className="w-full">
                {scrapedData.sections.map((section: Section, index: any) => (
                  <AccordionItem value={`section-${index}`} key={index}>
                    <AccordionTrigger>{section.title}</AccordionTrigger>
                    <AccordionContent>
                      <a
                        href={section.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {section.link}
                      </a>
                      {section.subsections.length > 0 && (
                        <ul className="list-disc pl-6 mt-2">
                          {section.subsections.map(
                            (subsection: any, subIndex: any) => (
                              <li key={subIndex}>
                                <a
                                  href={subsection.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {subsection.title}
                                </a>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocScraperUI;
