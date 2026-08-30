export type WnphPublicBlock = {
  render_path: string;
  block_key: string;
  ordinal: number | null;
  block_type: string;
  semantic_role: string;
  text_content: string | null;
};

export type WnphPublicChapter = {
  chapter_number: number;
  chapter_block_key: string;
  chapter_label: string;
  chapter_title: string;
  paragraph_count: number;
};

export type WnphPublicMediaPlacement = {
  placement_key: string;
  sequence_ordinal: number;
  media_role: string;
  anchor_kind: string;
  anchor_block_key: string | null;
  anchor_data: Record<string, unknown>;
  placement_policy: Record<string, unknown>;
  accessibility: Record<string, unknown>;
  image: {
    url: string;
    media_type: string;
    byte_length: number;
    sha256: string;
  };
};

type Creator = {
  creator_key: string;
  label: string;
  role: string;
  credit_status: string;
};

type Bibliographic = {
  work_key: string;
  title: string;
  work_type: string;
  language_code: string;
  expression_key: string;
  expression_type: string;
  creators: Creator[];
};

type ReleaseIdentity = {
  release_key: string;
  public_slug: string;
  release_sequence: number;
  released_at: string;
  render_master_sha256: string;
  payload_sha256?: string;
};

export type WnphPublicTitle = {
  contract_version: 'wnph_public_title_v1';
  release: ReleaseIdentity;
  bibliographic: Bibliographic;
  rights: Array<{ component_type: string; status: string; use_scope: string }>;
  chapters: WnphPublicChapter[];
  public_provenance: Record<string, unknown>;
};

export type WnphPublicChapterRead = {
  contract_version: 'wnph_public_read_chapter_v1';
  release: ReleaseIdentity;
  bibliographic: Bibliographic;
  chapter: WnphPublicChapter;
  chapter_count: number;
  previous_chapter: number | null;
  next_chapter: number | null;
  blocks: WnphPublicBlock[];
  media_placements: WnphPublicMediaPlacement[];
};

export type WnphPublicLibraryBook = {
  public_slug: string;
  release_sequence: number;
  released_at: string;
  render_master_sha256: string;
  payload_sha256: string;
  bibliographic: Bibliographic;
  chapter_count: number;
  media_count: number;
  representative_image: {
    url: string;
    media_type: string;
    byte_length: number;
    sha256: string;
  } | null;
};

export type WnphPublicLibraryShelf = {
  shelf_key: string;
  title: string;
  book_slugs: string[];
};

export type WnphPublicLibrary = {
  contract_version: 'wnph_public_library_v1';
  books: WnphPublicLibraryBook[];
  shelves: WnphPublicLibraryShelf[];
};

const SUPABASE_URL = 'https://zirqkouammpwxlqfbsvf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3UCb5b3USJD24c2uX6B_4A_0XWDT6si';

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T | null> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

export function getWnphPublicTitle(publicSlug: string) {
  return rpc<WnphPublicTitle>('wnph_public_title_v1', { p_public_slug: publicSlug });
}

export function getWnphPublicChapter(publicSlug: string, chapterNumber: number) {
  return rpc<WnphPublicChapterRead>('wnph_public_read_chapter_v1', {
    p_public_slug: publicSlug,
    p_chapter_number: chapterNumber,
  });
}

export function getWnphPublicLibrary() {
  return rpc<WnphPublicLibrary>('wnph_public_library_v1', {});
}
