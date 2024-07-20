export interface Subsection {
  // Assuming subsections have a similar structure to sections
  title: string;
  link: string;
  subsections: Subsection[];
}

export interface Section {
  title: string;
  link: string;
  subsections: Subsection[];
}

export interface ApiResponse {
  success: boolean;
  sections: Section[];
}
