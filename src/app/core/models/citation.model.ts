export interface Citation {
  id: string;
  title: string;
  citation_type: string;
  act_name?: string;
  section_number?: string;
  judgment_text?: string;
  court_name?: string;
  judgment_date?: string;
  case_reference?: string;
  notes?: string;
  keywords?: string[];
  category?: string;
  added_by?: string;
  created_at: string;
  updated_at: string;
}
