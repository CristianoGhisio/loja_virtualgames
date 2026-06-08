export type SchemaLD<T extends string = string> = {
  "@context": string;
  "@type": T;
} & Record<string, unknown>;

export function SchemaOrg({ schema }: { schema: SchemaLD }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
