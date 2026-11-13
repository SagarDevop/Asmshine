import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DEFAULT_POLICIES } from '../data/defaultPolicies';

/**
 * Utility to parse inline markdown (bold text, email addresses, hyperlinks)
 */
function renderInlineMarkdown(text) {
  if (!text) return null;
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\)|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 600, color: '#172B4D' }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('[') && match[2] && match[3]) {
      parts.push(
        <a key={match.index} href={match[3]} style={{ color: '#2563EB', textDecoration: 'underline' }}>
          {match[2]}
        </a>
      );
    } else if (token.includes('@')) {
      parts.push(
        <a key={match.index} href={`mailto:${token}`} style={{ color: '#2563EB', textDecoration: 'underline' }}>
          {token}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

export const LegalPolicyPage = ({ policyType, fallbackTitle }) => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallback = DEFAULT_POLICIES[policyType] || {
    title: fallbackTitle,
    version: '1.0',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-11-14',
    content: ''
  };

  useEffect(() => {
    let isMounted = true;
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const res = await api.getPublicPolicy(policyType);
        if (isMounted && res.success && res.data) {
          setPolicy(res.data);
        }
      } catch (err) {
        console.warn(`[LegalDocument] Using approved offline policy for ${policyType}:`, err.message);
        if (isMounted) {
          setPolicy({
            policyType,
            ...fallback
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPolicy();
    return () => {
      isMounted = false;
    };
  }, [policyType]);

  const activePolicy = policy || fallback;
  const pageTitle = activePolicy.title || fallbackTitle;

  // Set browser tab title
  useEffect(() => {
    document.title = `${pageTitle} — ASM Shine`;
    return () => {
      document.title = 'ASM Shine — Hygiene & Cleaning Formulations';
    };
  }, [pageTitle]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'January 1, 2026';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const rawContent = activePolicy.content || fallback.content || '';

  // Parse markdown content into structured document blocks
  const blocks = rawContent
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="legal-document-wrapper">
      <style>{`
        /* Standalone White Document Styles */
        html, body {
          background-color: #FFFFFF !important;
          margin: 0;
          padding: 0;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .legal-document-wrapper {
          min-height: 100vh;
          background-color: #FFFFFF;
          width: 100%;
          box-sizing: border-box;
          padding: 56px 24px 96px 24px;
        }

        .legal-document-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: #FFFFFF;
          box-sizing: border-box;
          text-align: left;
        }

        .legal-doc-title {
          font-size: 30px;
          line-height: 1.25;
          font-weight: 700;
          color: #172B4D;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
        }

        .legal-doc-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          font-weight: 400;
          color: #64748B;
          padding-bottom: 24px;
          margin-bottom: 32px;
          border-bottom: 1px solid #E2E8F0;
        }

        .legal-doc-meta span {
          display: inline-flex;
          align-items: center;
        }

        .legal-doc-heading {
          font-size: 18px;
          line-height: 1.4;
          font-weight: 600;
          color: #172B4D;
          margin: 32px 0 12px 0;
          letter-spacing: -0.01em;
          page-break-after: avoid;
          break-after: avoid;
        }

        .legal-doc-subheading {
          font-size: 15px;
          line-height: 1.4;
          font-weight: 600;
          color: #172B4D;
          margin: 20px 0 8px 0;
          page-break-after: avoid;
          break-after: avoid;
        }

        .legal-doc-paragraph {
          font-size: 14.5px;
          line-height: 1.75;
          font-weight: 400;
          color: #334155;
          margin: 0 0 16px 0;
        }

        .legal-doc-list {
          margin: 0 0 18px 0;
          padding-left: 22px;
          list-style-type: disc;
        }

        .legal-doc-list-item {
          font-size: 14.5px;
          line-height: 1.75;
          font-weight: 400;
          color: #334155;
          margin-bottom: 6px;
        }

        .legal-doc-divider {
          border: none;
          border-top: 1px solid #E2E8F0;
          margin: 32px 0;
        }

        /* Responsive Mobile Layout */
        @media (max-width: 640px) {
          .legal-document-wrapper {
            padding: 32px 20px 60px 20px;
          }

          .legal-doc-title {
            font-size: 25px;
            margin-bottom: 8px;
          }

          .legal-doc-meta {
            font-size: 12px;
            gap: 10px;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }

          .legal-doc-heading {
            font-size: 16.5px;
            margin-top: 26px;
            margin-bottom: 10px;
          }

          .legal-doc-paragraph, .legal-doc-list-item {
            font-size: 14px;
            line-height: 1.7;
          }
        }

        /* Clean Print Formatting */
        @media print {
          @page {
            margin: 20mm 15mm;
          }

          html, body, .legal-document-wrapper {
            background-color: #FFFFFF !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .legal-document-container {
            max-width: 100% !important;
            margin: 0 !important;
          }

          .legal-doc-title {
            font-size: 24pt !important;
            color: #000000 !important;
          }

          .legal-doc-meta {
            color: #555555 !important;
            border-bottom: 1pt solid #CCCCCC !important;
          }

          .legal-doc-heading {
            color: #000000 !important;
            break-after: avoid;
            page-break-after: avoid;
          }

          .legal-doc-paragraph, .legal-doc-list-item {
            color: #111111 !important;
          }
        }
      `}</style>

      <main className="legal-document-container" role="main">
        {/* Document Header */}
        <header style={{ marginBottom: '8px' }}>
          <h1 className="legal-doc-title">{pageTitle}</h1>
          <div className="legal-doc-meta">
            <span>Version: {activePolicy.version || fallback.version || '1.0'}</span>
            <span>•</span>
            <span>Effective Date: {formatDate(activePolicy.effectiveDate || fallback.effectiveDate)}</span>
            <span>•</span>
            <span>Last Updated: {formatDate(activePolicy.publishedAt || fallback.lastUpdated)}</span>
          </div>
        </header>

        {/* Document Content */}
        <article className="legal-doc-body">
          {blocks.map((block, idx) => {
            // Ignore the top document title if present as markdown # Title
            if (block.startsWith('# ')) {
              return null;
            }

            // Ignore redundant inline Effective Date line if present in markdown
            if (block.startsWith('**Effective Date:**') || block.startsWith('Effective Date:')) {
              return null;
            }

            // Horizontal rule
            if (block === '---' || block === '***') {
              return <hr key={idx} className="legal-doc-divider" />;
            }

            // Section Heading: ### 1. Introduction or #### Section
            if (block.startsWith('### ')) {
              const headingText = block.replace(/^###\s+/, '');
              return (
                <h2 key={idx} className="legal-doc-heading">
                  {headingText}
                </h2>
              );
            }

            // Subheading: #### Subheading
            if (block.startsWith('#### ')) {
              const subText = block.replace(/^####\s+/, '');
              return (
                <h3 key={idx} className="legal-doc-subheading">
                  {subText}
                </h3>
              );
            }

            // Numbered / bullet lists
            if (block.split('\n').some((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
              const lines = block.split('\n');
              return (
                <ul key={idx} className="legal-doc-list">
                  {lines.map((line, lIdx) => {
                    const clean = line.trim().replace(/^[-*]\s+/, '');
                    if (!clean) return null;
                    return (
                      <li key={lIdx} className="legal-doc-list-item">
                        {renderInlineMarkdown(clean)}
                      </li>
                    );
                  })}
                </ul>
              );
            }

            // Standard Body Paragraph
            return (
              <p key={idx} className="legal-doc-paragraph">
                {renderInlineMarkdown(block)}
              </p>
            );
          })}
        </article>
      </main>
    </div>
  );
};

export default LegalPolicyPage;
