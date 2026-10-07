import type { ChallengeConfig } from '../types';

const words = [
  ['only', 1, 1], ['sunny', 1, 2], ['day', 1, 3],
  ['fever', 2, 4], ['dream', 2, 5], ['high', 2, 6],
  ['forever', 3, 7], ['night', 3, 8], ['day', 3, 9],
  ['your', 4, 10], ['how', 4, 11], ['good', 4, 12],
] as const;

export const challengeConfig: ChallengeConfig = {
  title: '春泥棒', nftName: '《春》',
  clues: words.map(([word, group, slot], index) => ({
    id: `clue-${index + 1}`, group, word, slot, label: `第 ${slot} 位`, source: `group-${group}`,
    hints: [`这是第 ${group} 组线索。`, `把它放入第 ${slot} 个槽位。`, `词语是 ${word}。`],
  })),
  browserIndex: [
    { title: 'Taylor Swift — Cruel Summer', body: '播放记录显示：有人反复查找这首歌。请打开记录，填写歌词开头的前三个词。', tags: ['taylor swift', 'cruel summer', 'lyrics'], clueIds: ['clue-4', 'clue-5', 'clue-6'] },
    { title: '春日播放列表', body: '一些无关的春日音乐记录。', tags: ['spring', 'playlist'] },
    { title: '工作室公共搜索', body: '没有找到相关档案。', tags: ['wallet', 'nft'] },
  ],
  gameDefinitions: [
    { id: 'memory', title: '记忆配对', description: '把 12 张图标配成 6 对，全部完成后获得第三组的三个词。', clueIds: ['clue-7', 'clue-8', 'clue-9'] },
  ],
  cipherDefinitions: [
    { id: 'caesar', title: '凯撒移位', description: '把每个字母向左移动两格。', clueId: 'clue-10' },
    { id: 'keyboard', title: '键盘错位', description: '输入字符其实按到了右边的键。', clueId: 'clue-11' },
    { id: 'morse', title: '摩斯密码', description: '把点和划翻译成字母。', clueId: 'clue-12' },
  ],
  mnemonic: words.map(([word]) => word).join(' '), derivationPath: "m/44'/60'/0'/0/0",
  flagMode: 'xor-address', flagPayload: '40da8e7eff1543b74e61f593031deb5d8f3d6d4b37f4f356',
};
