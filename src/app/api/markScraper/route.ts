import axios from "axios";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

interface Subsection {
  title: string;
  link: string;
}

interface Section {
  title: string;
  link: string;
  paragraphs: string[];
  subsections: Subsection[];
}

interface ScrapedData {
  sections: Section[];
}

function isLikelyDocumentationLink(text: string): boolean {
  const docKeywords = [
    "guide",
    "doc",
    "api",
    "reference",
    "manual",
    "tutorial",
    "learn",
    "howto",
    "faq",
  ];
  return docKeywords.some((keyword) => text.toLowerCase().includes(keyword));
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { success: false, message: "URL is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const scrapedData: ScrapedData = { sections: [] };

    // Extract main content paragraphs
    const mainContentParagraphs: string[] = [];
    $("main, article, .content, #content")
      .find("p")
      .each((_, p) => {
        const paragraphText = $(p).text().trim();
        if (paragraphText) {
          mainContentParagraphs.push(paragraphText);
        }
      });

    $("h1, h2, h3").each((_, heading) => {
      const $heading = $(heading);
      const title = $heading.text().trim();
      const $link = $heading.find("a").first();
      const link = $link.attr("href") || "";

      if (title && (link || isLikelyDocumentationLink(title))) {
        const section: Section = {
          title,
          link: link ? new URL(link, url).toString() : "",
          paragraphs: [],
          subsections: [],
        };

        // Extract paragraphs following the heading
        let $next = $heading.next();
        while ($next.length && !$next.is("h1, h2, h3")) {
          if ($next.is("p")) {
            const paragraphText = $next.text().trim();
            if (paragraphText) {
              section.paragraphs.push(paragraphText);
            }
          } else if ($next.is("ul, ol")) {
            $next.find("li > a").each((_, subA) => {
              const $subA = $(subA);
              const subTitle = $subA.text().trim();
              const subLink = $subA.attr("href");
              if (subTitle && subLink) {
                section.subsections.push({
                  title: subTitle,
                  link: new URL(subLink, url).toString(),
                });
              }
            });
          }
          $next = $next.next();
        }

        scrapedData.sections.push(section);
      }
    });

    // If no sections were found, use the main content paragraphs
    if (scrapedData.sections.length === 0 && mainContentParagraphs.length > 0) {
      scrapedData.sections.push({
        title: "Main Content",
        link: url,
        paragraphs: mainContentParagraphs,
        subsections: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: scrapedData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "An error occurred while scraping" },
      { status: 500 }
    );
  }
}
