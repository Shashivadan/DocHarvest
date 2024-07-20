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

// let url = "https://docs.oracle.com/en/middleware/goldengate/core/index.html";
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "URL is required",
        },
        { status: 400 }
      );
    }

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const scrapedData: ScrapedData = { sections: [] };

    $("ul").each((_, ul) => {
      const $ul = $(ul);
      const directChildren = $ul.children("li");

      if (directChildren.length > 1 && directChildren.find("a").length > 0) {
        directChildren.each((_, li) => {
          const $li = $(li);
          const $mainLink = $li.children("a").first();
          const title = $mainLink.text().trim();
          const link = $mainLink.attr("href");

          if (title && link && isLikelyDocumentationLink(title)) {
            const section: Section = {
              title,
              link: new URL(link, url).toString(),
              subsections: [],
            };

            const $subList = $li.children("ul");
            if ($subList.length > 0) {
              $subList.find("li > a").each((_, subA) => {
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

            scrapedData.sections.push(section);
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: scrapedData,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while scraping",
      },
      { status: 500 }
    );
  }
}
