"use client";
import Clipboard from "./Clipboard";
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
import { Loader2, Copy } from "lucide-react";
import { ApiResponse, Section } from "@/lib/types";
import { toast } from "sonner";
import { generateMarkdown } from "@/lib/helper";

const DocScraperUI = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrapedData, setScrapedData] = useState<ApiResponse | null>();

  const downloadMarkdown = () => {
    if (!scrapedData || !url) {
      setError("An error occurred while making file ready");
      return;
    }
    const markdown = generateMarkdown(scrapedData);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = link;
    a.download = "documentation_structure.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const submithandler = async () => {
    setIsLoading(true);
    setError("");
    // setScrapedData(null);

    try {
      const { data } = await axios.post<Promise<ApiResponse>>(
        "/api/markScraper",
        {
          url,
        }
      );
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
        setScrapedData(null);
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
            <Button
              className="  bg-zinc-900 rounded-md"
              onClick={submithandler}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Scrape"
              )}
            </Button>
            <Button
              onClick={downloadMarkdown}
              className=" bg-zinc-900 rounded-lg"
            >
              Markdown
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
                    <AccordionContent className=" bg-zinc-800 p-2 rounded l-2 mb-2 flex  flex-col justify-between ">
                      <div className=" flex  justify-between">
                        <a
                          href={section.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 mt-2 hover:underline"
                        >
                          {section.link}
                        </a>
                        <Clipboard url={section.link} />
                      </div>
                      {section.subsections.length > 0 && (
                        <ul className="list-disc pl-6 mt-2">
                          {section.subsections.map(
                            (subsection: any, subIndex: any) => (
                              <li
                                key={subIndex}
                                className="flex flex-col gap-2"
                              >
                                <div className=" flex  justify-between ">
                                  <a
                                    href={subsection.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline mb-2"
                                  >
                                    {subsection.title}
                                  </a>
                                  <Clipboard url={subsection.title} />
                                </div>
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
