import React from "react";

type SchemaType = Record<string, any> | null | undefined | boolean;

interface JsonLdProps {
  schema: SchemaType | SchemaType[];
}

/**
 * JsonLd Component for Next.js App Router
 * Safely stringifies Schema.org JSON-LD structured data and embeds in HTML
 */
export function JsonLd({ schema }: JsonLdProps) {
  if (!schema) return null;

  const rawList = Array.isArray(schema) ? schema : [schema];
  const validSchemas = rawList.filter((s): s is Record<string, any> => Boolean(s) && typeof s === "object");

  if (validSchemas.length === 0) return null;

  const jsonString = JSON.stringify(
    validSchemas.length === 1 ? validSchemas[0] : validSchemas
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonString,
      }}
    />
  );
}

export default JsonLd;
