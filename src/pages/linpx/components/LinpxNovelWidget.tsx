import { renderImageText } from '@/pages/pixiv/novel/[id]/components/NovelContent';
import React, { useEffect, useRef, useState } from 'react';
import { useAnimeListRef } from '../utils/anime';
import LinpxNovel from '../utils/LinpxNovel';

export type ITextInfo = {
  text: string;
  style?: React.CSSProperties;
};

// 显示区域的底部边距，用户滑到底部时的冗余空白区域
const PaddingBottom = 200;
// 触达底部的预留判断距离，数值越大空得越多，不可超过PaddingBottom
const ReachBottomDistance = 20;

// todo: 销毁时似乎存在内存泄漏？novelInstance中的内容依旧运行着，只是提供的UI回调都失效了
export default function ({
  text,
  containerRef: parentContainerRef,
}: {
  text: string;
  containerRef?: React.RefObject<HTMLDivElement>;
}) {
  const [textInfoList, setTextInfoList] = useState<ITextInfo[]>([]);
  const [choiceList, setChoiceList] = useState<string[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 避免useEffect闭包陷阱
  const ref = useRef<{
    refTextList: ITextInfo[];
    refChoiceResolve: ((value: number) => void) | undefined;
  }>();
  ref.current = {
    refTextList: textInfoList,
    refChoiceResolve: ref.current?.refChoiceResolve,
  };

  useEffect(() => {
    const novelInstance = new LinpxNovel({
      text,
      showText: async (text) => {
        if (novelInstance.settingState['等待滚动']) {
          // 等待移动到底端
          let resolveBottomPromise: any = null;
          const id = setInterval(() => {
            const ele = parentContainerRef
              ? parentContainerRef.current
              : containerRef.current;
            if (ele && resolveBottomPromise) {
              const reachBottom =
                ele.scrollTop + ele.clientHeight >
                ele.scrollHeight - PaddingBottom + ReachBottomDistance;
              if (reachBottom) {
                clearInterval(id);
                resolveBottomPromise(null);
              }
            }
          }, 200);
          await new Promise((resolve) => (resolveBottomPromise = resolve));
        }
        // 过渡显示文本
        const refTextList = ref.current?.refTextList as ITextInfo[];
        setTextInfoList([...refTextList, text]);
        const isBlank = text.text === '\n';
        await new Promise((resolve) =>
          setTimeout(() => resolve(null), isBlank ? 100 : 400),
        );
      },
      showChoice: async (choiceList) => {
        setChoiceList(choiceList);
        const chosenIndex = await new Promise<number>(
          (resolve) => ((ref.current as any).refChoiceResolve = resolve),
        );
        return chosenIndex;
      },
      clearText: async () => {
        // 清空选项和文字记录
        setTextInfoList([]);
        setChoiceList(null);
      },
    });
    novelInstance.start();
  }, []);

  return (
    <div className="h-full overflow-y-scroll" ref={containerRef}>
      <div
        className="text-lg whitespace-pre-wrap"
        style={{ paddingBottom: PaddingBottom }}
      >
        {textInfoList.map(({ text, style }, index) => (
          <BottomFadeIn key={index}>
            <div style={style}>
              {
                // 渲染可能存在的pixiv图片
                text.includes('[uploadedimage:') ? renderImageText(text) : text
              }
            </div>
          </BottomFadeIn>
        ))}
        {choiceList && (
          <BottomFadeIn>
            <div className="flex justify-around">
              {choiceList.map((text, index) => (
                <div
                  key={index}
                  className="bg-gray-600 text-white rounded-lg py-2 px-4 my-2"
                  onClick={() => {
                    const choiceResolve = ref.current?.refChoiceResolve;
                    choiceResolve && choiceResolve(index);
                    setChoiceList(null);
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          </BottomFadeIn>
        )}
      </div>
    </div>
  );
}

const BottomFadeIn: React.FC = ({ children }) => {
  const ref = useAnimeListRef([
    {
      opacity: [0, 1.0],
      translateY: [10, 0],
      duration: 400,
      easing: 'easeInQuad',
    },
  ]);
  return (
    <div className="opacity-0" ref={ref}>
      {children}
    </div>
  );
};
