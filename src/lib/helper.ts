export const generateMarkdown = (scrapedData: any, url: string) => {
  if (!scrapedData) return "";

  let markdown = `# Documentation Structure for ${url}\n\n`;

  scrapedData.sections.forEach((section: any, index: number) => {
    markdown += `## ${index + 1}. ${section.title}\n\n`;
    markdown += `[${section.link}](${section.link})\n\n`;

    if (section.subsections.length > 0) {
      section.subsections.forEach((subsection: any, subIndex: any) => {
        markdown += `### ${index + 1}.${subIndex + 1}. ${subsection.title}\n\n`;
        markdown += `[${subsection.link}](${subsection.link})\n\n`;
      });
    }
  });

  return markdown;
};
