import type {SVGProps} from 'react';
import {
  siGithub, siLeetcode, siX, siPython, siTypescript, siJavascript, siPhp, siC, siCplusplus, siMysql,
  siNextdotjs, siReact, siNodedotjs, siNestjs, siDjango, siFastapi, siLaravel, siTailwindcss, siLocust,
  siPytorch, siTensorflow, siKeras, siScikitlearn, siLangchain, siPandas, siPostgresql, siMongodb,
  siRedis, siDocker, siGit, siCelery, siPostman, siFigma,
} from 'simple-icons';

const make = (path: string) =>
  function BrandIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d={path} />
      </svg>
    );
  };

// simple-icons dropped LinkedIn, so its glyph is inlined.
const linkedinPath =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

export const brandIcons = {
  GitHub: make(siGithub.path),
  LinkedIn: make(linkedinPath),
  LeetCode: make(siLeetcode.path),
  X: make(siX.path),
} as const;

/** Logos for skills. Skills without an entry (Java, SQL, Playwright, LlamaIndex, ChromaDB) have no logo in simple-icons. */
const skillBrand = {
  Python: siPython, TypeScript: siTypescript, JavaScript: siJavascript, PHP: siPhp, C: siC, 'C++': siCplusplus,
  'Next.js': siNextdotjs, React: siReact, 'Node.js': siNodedotjs, NestJS: siNestjs, Django: siDjango,
  FastAPI: siFastapi, Laravel: siLaravel, 'Tailwind CSS': siTailwindcss, Locust: siLocust,
  PyTorch: siPytorch, TensorFlow: siTensorflow, Keras: siKeras, 'scikit-learn': siScikitlearn,
  LangChain: siLangchain, Pandas: siPandas, PostgreSQL: siPostgresql, MySQL: siMysql, MongoDB: siMongodb,
  Redis: siRedis, Docker: siDocker, Git: siGit, Celery: siCelery, Postman: siPostman, Figma: siFigma,
};

export const skillIcons: Record<string, ReturnType<typeof make>> = Object.fromEntries(
  Object.entries(skillBrand).map(([k, v]) => [k, make(v.path)]),
);

/** Brand colours for skills with no logo in simple-icons (and the spoken languages). */
const extraColors: Record<string, string> = {
  Java: '#ed8b00', SQL: '#4479a1', Playwright: '#2ead33', LlamaIndex: '#a855f7', ChromaDB: '#f5a524',
  Bangla: '#00836c', English: '#2563eb', Japanese: '#dc2626',
};

/** Every skill gets its own colour: its brand colour when known, otherwise a steady colour derived from its name. */
export function skillColor(name: string): string {
  const b = (skillBrand as Record<string, {hex: string}>)[name];
  if (b) return `#${b.hex}`;
  if (extraColors[name]) return extraColors[name];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 62% 46%)`;
}
