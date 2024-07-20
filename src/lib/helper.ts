// export const generateMarkdown = (scrapedData: any, url: string) => {
//   if (!scrapedData || !url) return "";

//   let markdown = `# Documentation Structure for ${url}\n\n`;

//   scrapedData.sections.forEach((section: any, index: number) => {
//     markdown += `## ${index + 1}. ${section.title}\n\n`;
//     markdown += `[${section.link}](${section.link})\n\n`;

//     if (section.subsections.length > 0) {
//       section.subsections.forEach((subsection: any, subIndex: any) => {
//         markdown += `### ${index + 1}.${subIndex + 1}. ${subsection.title}\n\n`;
//         markdown += `[${subsection.link}](${subsection.link})\n\n`;
//       });
//     }
//   });

//   return markdown;
// };

export const generateMarkdown = (scrapedData: any) => {
  if (!scrapedData || !scrapedData.data) return "";

  let markdown = `# ${scrapedData.data.sections[0].title}\n\n`;

  scrapedData.data.sections.slice(1).forEach((section: any) => {
    markdown += `## ${section.title}\n\n`;

    if (section.link) {
      markdown += `[${section.link}](${section.link})\n\n`;
    }

    section.paragraphs.forEach((paragraph: string) => {
      markdown += `${paragraph}\n\n`;
    });

    if (section.subsections.length > 0) {
      section.subsections.forEach((subsection: any) => {
        markdown += `### ${subsection.title}\n\n`;
        if (subsection.link) {
          markdown += `[${subsection.link}](${subsection.link})\n\n`;
        }
      });
    }
  });

  return markdown;
};
