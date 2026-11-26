import {createContext, useContext, useEffect} from 'react';
import type {ReactNode} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {VStack} from '@astryxdesign/core/VStack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';

/** Pages that load on demand tell the app when they are on screen, so the scroll effects can attach to them. */
export const PageReady = createContext<() => void>(() => {});

export function InterestShell({title, intro, children}: {title: string; intro: string; children: ReactNode}) {
  const ready = useContext(PageReady);
  useEffect(() => { ready(); }, []); // once, when the page appears
  return (
    <>
      <VStack gap={4} paddingBlock={4}>
        <div data-hero>
          <RouterLink to="/" style={{color: 'inherit'}}>
            <Text color="secondary">← Home</Text>
          </RouterLink>
        </div>
        <div data-hero><Heading level={1} type="display-1" textWrap="balance">{title}</Heading></div>
        <div data-hero><Text type="large" color="secondary" textWrap="balance">{intro}</Text></div>
      </VStack>
      {children}
    </>
  );
}
