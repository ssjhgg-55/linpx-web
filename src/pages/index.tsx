import { history } from 'umi';
import {
  getRecommendPixivAuthors,
  getPixivUserList,
  getRecentNovels,
  getFavUserTagInfo,
} from '@/utils/api';
import { IUserInfo, INovelProfile } from '@/types';
import { useEffect, useState } from 'react';
import { ContentTitle, ContentBox } from './components/ContentLayout';
import TransLink from './components/TransLink';
import { InfoModal, showInfoModal } from './components/Modal';
import { TagBoxList } from '@/components/TagBox';
import UserPreview from './components/UserPreview';
import NovelPreview from './components/NovelPreview';
import HomeBanner from './components/HomeBanner';
import SearchBar from '../components/SearchBar';

let lastUserInfo: IUserInfo[] = Array(8).fill({
  imageUrl: '',
  name: '\n\n',
});

export default function IndexPage() {
  document.title = 'Linpx - 首页';

  const favUserData = getFavUserTagInfo();
  const tagListData = favUserData.data.slice(0, 8);

  // 红龙基金
  useEffect(() => {
    const initRDF =
      String(history.location.query?.from).toLocaleLowerCase() === 'rdf';
    if (initRDF) {
      showInfoModal({
        title: '红龙基金新人礼',
        children: (
          <div className="text-base">
            <div>礼品兑换码</div>
            <div>I8HLK-DQWR3-QJ404</div>
            <div>BQD0H-JBBCM-FALVH</div>
            <div>G69FV-WIIP7-EX9JQ</div>
          </div>
        ),
      });
    }
  }, []);

  // 加载首页作者
  const [userInfo, setUserInfo] = useState<IUserInfo[]>(lastUserInfo);
  useEffect(() => {
    getRecommendPixivAuthors().then((res) => {
      // 只取前十个作为随机推荐作者
      getPixivUserList((res as string[]).slice(0, 8)).then((res) => {
        lastUserInfo = res;
        setUserInfo(res);
      });
    });
  }, []);

  // 加载首页小说
  const emptyNovel = {
    title: '\n',
    userName: '\n',
  };
  const [novelsInfo, setNovelsInfo] = useState<INovelProfile[]>(
    Array(8).fill(emptyNovel),
  );
  useEffect(() => {
    getRecentNovels().then((res) => {
      setNovelsInfo(res);
    });
  }, []);

  return (
    <>
      <HomeBanner />
      <InfoModal />
      <div className="px-6 pb-6">
        <SearchBar onSearch={(word) => history.push(`/search?word=${word}`)} />
        <ContentTitle
          left="作者推荐"
          clickRightPath="/pixiv/recommend/users"
          clickInfo={
            <div className="text-base">
              <div>推荐一些不错的作者</div>
              <div>主要是兽文作者</div>
              <div>排序每天0点随机刷新一次</div>
              <div>欢迎举荐或自荐作者</div>
              <div>加群反馈：576268549</div>
            </div>
          }
        />
        <ContentBox>
          {lastUserInfo.map((ele, index) => (
            <UserPreview key={ele.id || index} {...ele} />
          ))}
        </ContentBox>

        <ContentTitle
          left="最新小说"
          clickRightPath="/pixiv/recent/novels"
          clickInfo={
            <div className="text-base">
              <div>推荐作者按时间线排序的小说</div>
              <div>可以翻到很久很久前的小说</div>
            </div>
          }
        />
        <ContentBox>
          <div className="px-2 flex">
            {novelsInfo.map((novel, index) => {
              return (
                <div className="p-2" key={novel.id || index}>
                  <NovelPreview {...novel} />
                </div>
              );
            })}
          </div>
        </ContentBox>

        <ContentTitle
          left="全站tag"
          clickRightPath="/pixiv/tags"
          clickInfo={
            <div className="text-base">
              <div>所有推荐作者的tag统计</div>
              <div>可以按tag快速检索想看的小说</div>
              <div>手动更新，存在一定延迟</div>
            </div>
          }
        />
        <TagBoxList
          tagList={tagListData}
          onClickTag={(tagName) => history.push(`/pixiv/tag/${tagName}`)}
        />

        <ContentTitle
          left="生成LINPX链接"
          right=""
          clickInfo={
            <div className="text-base break-all">
              <div>将pixiv链接转为linpx</div>
              <div>从而不需要翻墙、登录，点开即阅</div>
              <br />
              <div>当前支持作者和小说两种格式链接</div>
              <div className="text-left">
                <div>作者举例：https://www.pixiv.net/users/32809296</div>
                <div>
                  小说举例：https://www.pixiv.net/novel/show.php?id=14198407
                </div>
              </div>
            </div>
          }
        />
        <ContentBox>
          <TransLink />
        </ContentBox>
      </div>
    </>
  );
}
