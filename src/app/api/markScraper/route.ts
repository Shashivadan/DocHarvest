import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface ContentItem {
  type: "heading" | "paragraph";
  level?: number; // For headings
  content: string;
}

interface ScrapedData {
  title: string;
  content: ContentItem[];
  links: { text: string; url: string }[];
}

async function scrapeFullPageContent(url: string): Promise<ScrapedData> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  const scrapedData = await page.evaluate(() => {
    const title = document.title;

    function getContentItems(element: Element): ContentItem[] {
      const items: ContentItem[] = [];
      const paragraphContents: string[] = [];
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            if (node.nodeName.match(/^H[1-6]$/) || node.nodeName === "P") {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          },
        }
      );

      let currentNode: Node | null;
      while ((currentNode = walker.nextNode())) {
        const elem = currentNode as Element;
        const content = elem.textContent?.trim() || "";
        if (content) {
          if (elem.nodeName.match(/^H[1-6]$/)) {
            // Push accumulated paragraphs before adding a heading
            if (paragraphContents.length > 0) {
              items.push({
                type: "paragraph",
                content: paragraphContents.join(" "),
              });
              paragraphContents.length = 0; // Clear the array
            }
            items.push({
              type: "heading",
              level: parseInt(elem.nodeName.charAt(1)),
              content: content,
            });
          } else if (elem.nodeName === "P") {
            paragraphContents.push(content);
          }
        }
      }
      // Push remaining paragraphs if any
      if (paragraphContents.length > 0) {
        items.push({
          type: "paragraph",
          content: paragraphContents.join(" "),
        });
      }
      return items;
    }

    const content = getContentItems(document.body);

    const links = Array.from(document.querySelectorAll("a"))
      .map((a) => ({ text: a.textContent?.trim() || "", url: a.href }))
      .filter((link) => link.text && link.url);

    return { title, content, links };
  });

  await browser.close();
  return scrapedData;
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

    const scrapedData = await scrapeFullPageContent(url);

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
