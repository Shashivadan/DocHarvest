import axios from "axios";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

const url = "https://nodejs.org/docs/latest/api/";

interface Subsection {
  title: string;
  link: string;
}

interface Section {
  link: string;
  subsections: Subsection[];
}

interface ScrapedData {
  [key: string]: Section;
}

export async function POST(req: NextRequest) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const scrapedData: ScrapedData = {};

    $("#column2 > ul > li").each((index, element) => {
      const sectionTitle = $(element).find("a").text().trim();
      const sectionLink = $(element).find("a").attr("href");
      if (sectionLink) {
        scrapedData[sectionTitle] = {
          link: url + sectionLink,
          subsections: [],
        };

        $(element)
          .find("ul > li")
          .each((i, el) => {
            const subsectionTitle = $(el).find("a").text().trim();
            const subsectionLink = $(el).find("a").attr("href");
            if (subsectionLink) {
              scrapedData[sectionTitle].subsections.push({
                title: subsectionTitle,
                link: url + subsectionLink,
              });
            }
          });
      }
    });
    console.log(scrapedData);

    return NextResponse.json({
      data: "hii",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while scraping",
      },
      {}
    );
  }
}
