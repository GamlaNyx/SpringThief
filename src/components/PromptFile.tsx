export function PromptFile() {
  return <div className="prompt-file">
    <div className="prompt-toolbar"><button>文件(F)</button><button>编辑(E)</button><button>格式(O)</button><button>查看(V)</button><button>帮助(H)</button></div>
    <pre>{`春泥棒：NFT《春》失窃案\n\n工作室钱包里的 NFT《春》被偷走了。\n请在这台电脑里寻找小偷留下的线索。\n\n调查顺序建议：\n1. 打开“档案室”，阅读第一组词。\n2. 使用“浏览器”搜索第二组词。\n3. 在“游戏中心”完成三项小游戏。\n4. 在“解密终端”完成三种低门槛解密。\n5. 打开“钱包恢复台”，按 1-12 位整理助记词。\n\n目标：理解助记词、私钥和地址的关系，\n并找回被偷走的 NFT。\n\n提示：线索背包会记录你拿到的每个词。\n本题所有计算都在本地进行，仅使用练习数据。`}</pre>
    <div className="prompt-status">题目提示.txt　　　行 1，列 1　　　Windows 文本文件</div>
  </div>;
}
