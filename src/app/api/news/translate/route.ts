import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticleTranslation } from '@/lib/db';
import { translateToChicese } from '@/lib/deepseek';

// Fallback translations for mock articles when DeepSeek is unavailable
const mockTranslations: { [key: number]: string } = {
  1: '2025年全球糖价下跌约17%，分析师预计看跌趋势将延续至2026年。由于主要生产国供应充足，加之巴西天气良好和印度产量恢复，市场出现过剩。',
  2: '国际糖业组织(ISO)预测2025-26年度全球糖市将出现162.5万吨过剩，此前2024-25年度为291.6万吨缺口。该组织预计全球糖产量将同比增长3.2%至1.818亿吨。',
  3: 'Czarnikow将2025/26年度全球糖过剩预估上调至870万吨，较9月预估的750万吨增加120万吨。修正反映了主要产区超预期的收成。',
  4: '美国农业部经济研究局发布2026年1月糖和甜味剂展望报告，详细说明了2024/25和2025/26年度美国和墨西哥糖供需预测的变化。',
  5: '在2025/26年度全球供应充足的预期下，糖价跌至多年低点。3月糖期货收于14.72美分/磅，接近2023年12月以来的最低水平。',
  6: '巴西咨询公司Safras & Mercado预测，巴西2026/27年度糖产量将下降3.91%至4180万吨。该公司还预计巴西糖出口将同比下降11%至3000万吨。',
  7: 'ING分析师预测2026年原糖11号合约均价为15.40美分/磅，第三季度预计最弱，届时正值巴西中南部收获高峰期。大量过剩表明糖价将持续承压。',
  8: '荷兰合作银行预计2025/26年度全球糖市将出现约260万吨过剩，主要受印度产量恢复推动。该行指出，虽然汇率变动可能提供一定支撑，但基本面过剩将限制价格大幅上涨。',
  9: '泰国糖出口同比激增25%，产量从干旱中恢复。泰国糖厂公司报告称，2025/26榨季进展顺利，总产量预计达到1050万吨，高于上榨季的840万吨。',
  10: '标普全球大宗商品洞察报告称，糖市面临的结构性过剩状况可能持续至2027年。主要种植区生产效率提升和种植面积扩大已超过需求增长。',
  11: '印度政府即日起解除食糖出口禁令，允许糖厂本榨季出口最多200万吨。这一决定是在强劲季风提振甘蔗产量后作出的。',
  12: '欧盟甜菜收成超预期，产量估计为1620万吨糖当量，同比增长8%。法国、德国和波兰良好的生长条件带来了更高的单产。',
  14: '3月糖期货在2025年收于15.01美分/磅，全年下跌。2026年初糖价仍接近多年低点。技术分析师认为市场可能在14.50美分附近获得支撑。',
  15: '经过多年软商品剧烈波动后，分析师质疑危机是否终于结束。虽然可可和咖啡价格仍处高位，但糖市已进入明显的熊市。',
  16: '巴西雷亚尔兑美元走强，糖价获得暂时支撑，因出口对巴西生产商的吸引力下降。货币驱动的反弹使3月期货单日上涨2%。',
  17: '肯尼亚将担任国际糖业组织(ISO)2026年理事会主席。肯尼亚糖业委员会首席执行官Jude K. Chesire先生将主持理事会会议。',
  18: '美国农业部农场服务局宣布2026财年食糖贷款利率，确认不采取饲料灵活性计划措施。原糖贷款利率维持在20.75美分/磅。',
  20: '澳大利亚2025年糖出口创历史新高，总出货量超过420万吨。来自亚洲市场，特别是印度尼西亚和韩国的强劲需求推动了增长。',
};

// POST - Translate article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId || typeof articleId !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid article ID',
        },
        { status: 400 }
      );
    }

    // Try to get article from database
    try {
      const result = await getArticleById(articleId);

      if (result.rows.length > 0) {
        const article = result.rows[0];

        // Check if already translated
        if (article.is_translated && article.translated_content) {
          return NextResponse.json({
            success: true,
            data: {
              translatedContent: article.translated_content,
              cached: true,
            },
          });
        }

        // Translate the content using DeepSeek
        const translatedContent = await translateToChicese(article.content);

        if (translatedContent) {
          // Save translation to database
          await updateArticleTranslation(articleId, translatedContent);

          return NextResponse.json({
            success: true,
            data: {
              translatedContent,
              cached: false,
            },
          });
        }
      }
    } catch (dbError) {
      console.log('Database not available, using mock/DeepSeek translation');
    }

    // For mock articles, try DeepSeek first, then fallback to cached translations
    // Fetch the article content from our news API
    const newsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/news`);
    const newsData = await newsResponse.json();

    if (newsData.success) {
      const article = newsData.data.articles.find((a: { id: number }) => a.id === articleId);

      if (article && article.content) {
        // Try real translation with DeepSeek
        const translatedContent = await translateToChicese(article.content);

        if (translatedContent) {
          return NextResponse.json({
            success: true,
            data: {
              translatedContent,
              cached: false,
            },
          });
        }
      }
    }

    // Fallback to pre-cached mock translations
    if (mockTranslations[articleId]) {
      return NextResponse.json({
        success: true,
        data: {
          translatedContent: mockTranslations[articleId],
          cached: true,
        },
      });
    }

    // Generic fallback message
    return NextResponse.json({
      success: true,
      data: {
        translatedContent: '翻译服务暂时不可用，请稍后重试。',
        cached: false,
      },
    });
  } catch (error) {
    console.error('Error translating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to translate article',
      },
      { status: 500 }
    );
  }
}
