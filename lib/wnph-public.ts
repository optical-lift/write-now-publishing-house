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

export type WnphPublicRelease = {
  contract_version: 'wnph_publication_release_v1';
  payload_sha256: string;
  payload: {
    contract_version: 'wnph_publication_public_release_payload_v1';
    release: {
      release_key: string;
      public_slug: string;
      release_sequence: number;
      released_at: string;
      render_master_sha256: string;
      frozen: boolean;
      read_only: boolean;
    };
    bibliographic: {
      work_key: string;
      title: string;
      work_type: string;
      language_code: string;
      expression_key: string;
      expression_type: string;
      creators: Array<{
        creator_key: string;
        label: string;
        role: string;
        credit_status: string;
      }>;
    };
    rights: Array<{
      component_type: string;
      status: string;
      use_scope: string;
    }>;
    chapters: WnphPublicChapter[];
    ordered_blocks: WnphPublicBlock[];
    media_placements: WnphPublicMediaPlacement[];
    public_provenance: Record<string, unknown>;
  };
};

const SUPABASE_URL = 'https://zirqkouammpwxlqfbsvf.supabase.co';

// This is intentionally a Supabase publishable key, not a secret credential.
// Its authority is limited by the database grants on the public-release RPC.
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3UCb5b3USJD24c2uX6B_4A_0XWDT6si';

export async function getWnphPublicRelease(publicSlug: string): Promise<WnphPublicRelease | null> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/wnph_publication_release_v1`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_public_slug: publicSlug }),
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return (await response.json()) as WnphPublicRelease;
}
