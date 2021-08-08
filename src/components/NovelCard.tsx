import { INovelProfile } from '@/types';
import { history } from 'umi';
import { LikeOutlined } from '@ant-design/icons';

// 最近小说页面
// 作者详情页面
export default function NovelCard({
  id,
  title,
  userName,
  desc,
  coverUrl,
  tags,
  length,
  createDate,
  pixivLikeCount,
  likeCount,
}: INovelProfile) {
  return (
    <div
      className="lp-shadow my-5 flex lp-bgcolor overflow-hidden w-full"
      onClick={() => history.push(`/pixiv/novel/${id}`)}
    >
      <div className="lp-shadow w-20 bg-white m-3 overflow-hidden flex-shrink-0 flex flex-col items-center justify-center">
        <img
          className="h-24 w-full object-cover"
          src={coverUrl}
          loading="lazy"
        />
        <div
          className="h-4 text-xs w-full flex justify-center items-center"
          style={{ boxShadow: '0 0 14px #888' }}
        >
          {pixivLikeCount + likeCount}
          <LikeOutlined size={12} color="orange" className="ml-1" />
        </div>
      </div>
      <div className="text-left flex flex-col mt-2 mr-2 flex-shrink flex-grow overflow-x-auto">
        <div className="font-black u-line-1">{title}</div>
        <div className="text-xs">
          {userName}
          <span className="inline-block ml-2 font-normal text-gray-400">
            {length}字
          </span>
          <span className="inline-block ml-2 font-normal text-gray-400">
            {new Date(createDate).toLocaleDateString()}
          </span>
        </div>
        <div className="text-xs text-blue-400 u-line-1">
          {tags.map((tag) => (
            <span key={tag}>#{tag} </span>
          ))}
        </div>
        <div
          className="text-sm u-line-3 overflow-hidden"
          style={{ pointerEvents: 'none' }}
          dangerouslySetInnerHTML={{ __html: desc }}
        />
      </div>
    </div>
  );
}
