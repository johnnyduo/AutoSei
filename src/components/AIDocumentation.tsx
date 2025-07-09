// src/components/AIDocumentation.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Database, Brain, AlertTriangle, Code, BarChart2 } from 'lucide-react';

const AIDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-[#FF5723]" />
            <CardTitle className="text-2xl cosmic-text">AutoSei AI System Documentation</CardTitle>
          </div>
          <CardDescription>
            Comprehensive guide to AutoSei's AI-powered DeFi portfolio navigation and market intelligence system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                <span>AI Models</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                <span>Data Sources</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>Prompt Engineering</span>
              </TabsTrigger>
              <TabsTrigger value="limitations" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Limitations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold cosmic-text">AI-Powered DeFi Portfolio Navigator</h2>
                <p>
                  AutoSei revolutionizes DeFi portfolio management on the Sei EVM network through advanced artificial intelligence. 
                  Our AI system combines Google's Gemini 2.5 Pro with specialized financial algorithms to provide intelligent 
                  portfolio optimization, real-time whale tracking, and conversational market insights.
                </p>
                
                <h3 className="text-lg font-semibold mt-4 text-[#FF5723]">Core AI Features</h3>
                <ul>
                  <li>
                    <strong>Conversational Portfolio Analysis</strong>: Natural language interface powered by Gemini 2.5 Pro 
                    for discussing portfolio strategies, risk assessment, and market conditions in plain English
                  </li>
                  <li>
                    <strong>Smart Contract Portfolio Management</strong>: AI-driven allocation recommendations across 7 asset 
                    categories (AI, Meme, RWA, BigCap, DeFi, L1, Stablecoin) with automated rebalancing
                  </li>
                  <li>
                    <strong>Real-time Whale Activity Tracking</strong>: Intelligent monitoring of large transactions on Sei EVM 
                    with predictive market impact analysis and automated alerts
                  </li>
                  <li>
                    <strong>SeiTrace Integration</strong>: Deep blockchain analysis using Sei's native explorer API for 
                    comprehensive on-chain intelligence and transaction pattern recognition
                  </li>
                  <li>
                    <strong>50+ Token Intelligence</strong>: AI-powered insights for all supported tokens on Sei EVM, 
                    including market analysis, technical indicators, and fundamental research
                  </li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4 text-[#FF5723]">Hybrid AI Architecture</h3>
                <p>
                  AutoSei's AI system employs a sophisticated hybrid approach optimized for DeFi applications:
                </p>
                <ul>
                  <li><strong>Google Gemini 2.5 Pro</strong>: Advanced language model for natural conversations and complex analysis</li>
                  <li><strong>Financial Rule Engine</strong>: Specialized algorithms for portfolio validation and risk management</li>
                  <li><strong>Pattern Recognition AI</strong>: Machine learning for whale behavior and market trend identification</li>
                  <li><strong>Sei EVM Analytics</strong>: Custom intelligence layer for blockchain-specific insights</li>
                  <li><strong>Real-time Data Fusion</strong>: Intelligent aggregation of SeiTrace, CoinGecko, and market data</li>
                </ul>
                
                <div className="bg-gradient-to-r from-[#FF5723]/10 to-purple-500/10 rounded-lg p-4 border border-[#FF5723]/20 mt-4">
                  <h4 className="font-semibold text-[#FF5723] mb-2">🚀 Sei EVM Native Features</h4>
                  <p className="text-sm">
                    AutoSei is built specifically for the Sei ecosystem, leveraging Sei's unique parallel execution, 
                    twin-turbo consensus, and native orderbook to provide unparalleled DeFi intelligence and portfolio management.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="models" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold cosmic-text">AI Models & Technologies</h2>
                <p>
                  AutoSei leverages cutting-edge AI technologies specifically optimized for DeFi portfolio management 
                  and blockchain analysis. Our primary AI engine is Google's Gemini 2.5 Pro, enhanced with specialized 
                  components for financial analysis and Sei EVM integration.
                </p>
                
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20 mt-4">
                  <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Google Gemini 2.5 Pro - Primary AI Engine
                  </h3>
                  <p className="mt-2">
                    Gemini 2.5 Pro serves as AutoSei's conversational AI brain, enabling sophisticated natural language 
                    understanding for complex DeFi portfolio discussions and market analysis.
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Portfolio Conversations</strong>: Discuss allocation strategies in natural language</li>
                    <li><strong>Market Analysis</strong>: Generate detailed insights on Sei EVM tokens and protocols</li>
                    <li><strong>Risk Assessment</strong>: Explain portfolio risks and diversification strategies</li>
                    <li><strong>Educational Content</strong>: Simplify complex DeFi concepts for all user levels</li>
                    <li><strong>Whale Activity Analysis</strong>: Interpret large transaction impacts and implications</li>
                  </ul>
                  <div className="mt-3 p-2 bg-purple-500/10 rounded text-xs">
                    <strong>AutoSei Enhancement:</strong> Custom prompt engineering for Sei ecosystem, DeFi protocols, 
                    and portfolio management best practices.
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-[#FF5723]/10 to-orange-500/10 rounded-lg p-4 border border-[#FF5723]/20 mt-4">
                  <h3 className="text-lg font-semibold text-[#FF5723] flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Financial Analytics Engine
                  </h3>
                  <p className="mt-2">
                    Specialized algorithms designed for DeFi portfolio management and risk analysis:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>7-Category Allocation Model</strong>: AI, Meme, RWA, BigCap, DeFi, L1, Stablecoin optimization</li>
                    <li><strong>Risk-Adjusted Scoring</strong>: Dynamic portfolio performance evaluation</li>
                    <li><strong>Rebalancing Algorithms</strong>: Smart contract-based automated portfolio adjustments</li>
                    <li><strong>Correlation Analysis</strong>: Inter-category and token correlation modeling</li>
                    <li><strong>Volatility Prediction</strong>: Market stability forecasting for Sei EVM assets</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20 mt-4">
                  <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Sei EVM Intelligence Layer
                  </h3>
                  <p className="mt-2">
                    Custom AI models trained specifically for Sei blockchain analysis:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>SeiTrace Integration</strong>: Real-time blockchain data processing and analysis</li>
                    <li><strong>Whale Detection</strong>: Pattern recognition for large transaction identification</li>
                    <li><strong>Contract Intelligence</strong>: Smart contract interaction analysis and optimization</li>
                    <li><strong>Network Activity Monitoring</strong>: Sei EVM usage patterns and congestion prediction</li>
                    <li><strong>Token Performance Tracking</strong>: Historical and predictive analysis for 50+ tokens</li>
                  </ul>
                </div>
                
                <h3 className="text-lg font-semibold mt-4 text-[#FF5723]">Intelligent Model Selection</h3>
                <p>
                  AutoSei's AI orchestrator dynamically selects optimal models based on:
                </p>
                <ul>
                  <li><strong>Query Type</strong>: Conversational vs analytical vs predictive requests</li>
                  <li><strong>Data Complexity</strong>: Simple portfolio questions vs complex market analysis</li>
                  <li><strong>Response Time Requirements</strong>: Real-time whale alerts vs detailed research</li>
                  <li><strong>Confidence Thresholds</strong>: Fallback to rule-based systems when AI confidence is low</li>
                  <li><strong>User Context</strong>: Portfolio composition and risk tolerance considerations</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold cosmic-text">Data Sources & Integration</h2>
                <p>
                  AutoSei's AI system integrates multiple high-quality data sources to provide comprehensive insights 
                  for DeFi decision-making. Our data pipeline combines real-time Sei blockchain data, market intelligence, 
                  and historical patterns specifically optimized for the Sei EVM ecosystem.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gradient-to-r from-[#FF5723]/10 to-orange-500/10 rounded-lg p-4 border border-[#FF5723]/20">
                    <h3 className="text-lg font-semibold text-[#FF5723] flex items-center gap-2">
                      <BarChart2 className="h-5 w-5" />
                      Sei EVM Blockchain Data
                    </h3>
                    <ul className="mt-2 space-y-1">
                      <li><strong>SeiTrace Explorer API</strong>: Real-time transaction monitoring and analysis</li>
                      <li><strong>Smart Contract Events</strong>: AutoSei portfolio contract interactions</li>
                      <li><strong>Whale Detection</strong>: Large transaction identification ($10,000+ threshold)</li>
                      <li><strong>Token Transfers</strong>: 50+ supported ERC-20 tokens on Sei EVM</li>
                      <li><strong>Wallet Patterns</strong>: Address behavior and interaction analysis</li>
                      <li><strong>Network Health</strong>: Gas fees, block times, and congestion metrics</li>
                    </ul>
                    <div className="mt-2 p-2 bg-[#FF5723]/10 rounded text-xs">
                      <strong>Real-time Processing:</strong> Sub-second latency for blockchain events and whale alerts
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                    <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Market Intelligence
                    </h3>
                    <ul className="mt-2 space-y-1">
                      <li><strong>CoinGecko API</strong>: Token prices, market caps, and 24h volumes</li>
                      <li><strong>Historical Data</strong>: Price patterns and correlation analysis</li>
                      <li><strong>Yield Tracking</strong>: DeFi protocol APY and TVL metrics</li>
                      <li><strong>Market Sentiment</strong>: Social signals and trading volume trends</li>
                      <li><strong>Category Performance</strong>: AI, Meme, RWA, BigCap, DeFi, L1 sector analysis</li>
                      <li><strong>Risk Metrics</strong>: Volatility, correlation, and drawdown statistics</li>
                    </ul>
                    <div className="mt-2 p-2 bg-blue-500/10 rounded text-xs">
                      <strong>Update Frequency:</strong> Real-time prices with 5-minute market data refresh
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20 mt-4">
                  <h3 className="text-lg font-semibold text-purple-400">🎯 Token Universe (50+ Supported)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2 text-sm">
                    <div><strong>AI Category:</strong> DEEP, PUNK</div>
                    <div><strong>Meme/NFT:</strong> WEN, BEAST, FISH</div>
                    <div><strong>RWA:</strong> ASMB, LUM, MLUM</div>
                    <div><strong>BigCap:</strong> BTC, ETH, SEI</div>
                    <div><strong>DeFi:</strong> AVAX, FTM, MATIC</div>
                    <div><strong>L1:</strong> SMR, FUSE, IPG</div>
                    <div><strong>Stable:</strong> USDC, USDT</div>
                    <div><strong>Others:</strong> AAP, AUR, HODLHamster, NHU, LOVE, wBNB</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mt-4 text-[#FF5723]">Advanced Data Processing Pipeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <h4 className="font-semibold text-purple-400">Real-time Processing</h4>
                    <ol className="text-sm space-y-1 mt-1">
                      <li><strong>1. Data Ingestion</strong>: Multi-source API aggregation with error handling</li>
                      <li><strong>2. Validation</strong>: Data quality checks and anomaly detection</li>
                      <li><strong>3. Normalization</strong>: Format standardization across all sources</li>
                      <li><strong>4. Enrichment</strong>: Context addition and pattern recognition</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-400">AI Enhancement</h4>
                    <ol className="text-sm space-y-1 mt-1">
                      <li><strong>1. Feature Extraction</strong>: Key metrics and trend identification</li>
                      <li><strong>2. Context Building</strong>: Historical pattern correlation</li>
                      <li><strong>3. Prompt Enrichment</strong>: Data integration for AI models</li>
                      <li><strong>4. Response Validation</strong>: AI output quality assurance</li>
                    </ol>
                  </div>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-green-400">🔒 Privacy & Security</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li><strong>Public Data Only</strong>: All blockchain data is publicly available on Sei EVM</li>
                    <li><strong>Local Processing</strong>: Portfolio calculations performed client-side when possible</li>
                    <li><strong>Minimal PII</strong>: No personally identifiable information collected or stored</li>
                    <li><strong>Secure APIs</strong>: Encrypted connections with rate limiting and authentication</li>
                    <li><strong>Data Retention</strong>: Chat history stored locally with user control</li>
                    <li><strong>Compliance</strong>: GDPR-compliant data handling and user rights</li>
                  </ul>
                </div>
                
                <h3 className="text-lg font-semibold mt-4 text-[#FF5723]">Data Quality & Reliability</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Redundancy:</strong> Multiple data sources ensure continuity if any single API fails
                  </p>
                  <p>
                    <strong>Caching Strategy:</strong> Intelligent caching reduces API calls while maintaining freshness
                  </p>
                  <p>
                    <strong>Error Handling:</strong> Graceful fallbacks and user notifications for data issues
                  </p>
                  <p>
                    <strong>Monitoring:</strong> Real-time data quality monitoring with automated alerts
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="prompts" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold">Prompt Engineering</h2>
                <p>
                  The effectiveness of our AI system relies heavily on sophisticated prompt engineering. 
                  We've developed specialized prompts for different financial and blockchain analysis tasks.
                </p>
                
                <h3 className="text-lg font-semibold mt-4">Prompt Design Principles</h3>
                <ul>
                  <li><strong>Specificity</strong>: Prompts include detailed instructions and context</li>
                  <li><strong>Structure</strong>: Consistent formatting for predictable outputs</li>
                  <li><strong>Context</strong>: Relevant market and blockchain data is included</li>
                  <li><strong>Constraints</strong>: Clear guidelines for responsible financial advice</li>
                </ul>
                
                <div className="bg-cosmic-800 p-4 rounded-lg mt-4 font-mono text-sm overflow-x-auto">
                  <h3 className="text-nebula-400 font-semibold mb-2">Example: Whale Transaction Analysis Prompt</h3>
                  <pre className="whitespace-pre-wrap">
{`You are a blockchain analyst specializing in whale transaction analysis for the Sei ecosystem. 
Analyze this whale transaction and provide insights:

Transaction Details:
- Type: {transaction.type} (buy/sell/transfer)
- Token: {transaction.tokenSymbol} ({transaction.tokenName})
- Amount: {transaction.valueFormatted} tokens
- USD Value: {transaction.usdValue}
- From: {transaction.from}
- To: {transaction.to}
- Time: {transaction.age}
- Hash: {transaction.hash}

Please provide a comprehensive analysis including:
1. Transaction overview and significance
2. Analysis of the sender and recipient wallets
3. Potential market impact of this transaction
4. Related on-chain activity and patterns
5. Recommendations for traders/investors

Format your response in Markdown with appropriate headings and bullet points.
Keep your analysis factual and evidence-based. Mention if certain conclusions are speculative.`}
                  </pre>
                </div>
                
                <div className="bg-cosmic-800 p-4 rounded-lg mt-4 font-mono text-sm overflow-x-auto">
                  <h3 className="text-nebula-400 font-semibold mb-2">Example: Portfolio Rebalancing Prompt</h3>
                  <pre className="whitespace-pre-wrap">
{`You are an AI portfolio advisor specializing in crypto asset allocation for the Sei ecosystem.
Analyze the user's current portfolio and market conditions to provide rebalancing advice:

Current Portfolio:
{allocations.map(a => \`- \${a.name}: \${a.allocation}%\`).join('\\n')}

Market Conditions:
- Overall Market: {marketCondition}
- Sector Performance: {sectorPerformance}
- Risk Metrics: {riskMetrics}

User Query: {userMessage}

Provide a thoughtful analysis and recommendation including:
1. Assessment of current allocation strengths and weaknesses
2. Specific rebalancing suggestions with percentages
3. Rationale for each suggested change
4. Risk considerations and potential downsides
5. Timeline recommendations (immediate vs gradual changes)

Format your response in clear sections. Always maintain a total allocation of 100%.
Avoid excessive risk and maintain appropriate diversification.
Clearly indicate when advice is speculative vs data-driven.`}
                  </pre>
                </div>
                
                <h3 className="text-lg font-semibold mt-4">Dynamic Prompt Generation</h3>
                <p>
                  Our system dynamically generates prompts based on:
                </p>
                <ul>
                  <li>User query context and history</li>
                  <li>Current market conditions</li>
                  <li>Available on-chain data</li>
                  <li>Portfolio composition</li>
                </ul>
                <p>
                  This ensures that the AI receives the most relevant information for each specific request.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="limitations" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold">Limitations and Ethical Considerations</h2>
                <p>
                  While our AI system provides valuable insights, it's important to understand its limitations 
                  and the ethical considerations we've incorporated into its design.
                </p>
                
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Key Limitations
                  </h3>
                  <ul className="mt-2">
                    <li><strong>Not Financial Advice</strong>: Our AI provides analysis and suggestions, not professional financial advice</li>
                    <li><strong>Market Unpredictability</strong>: No AI can predict market movements with certainty</li>
                    <li><strong>Data Limitations</strong>: Analysis is based on available public data which may be incomplete</li>
                    <li><strong>Model Constraints</strong>: AI models have inherent limitations in understanding complex market dynamics</li>
                    <li><strong>Latency Issues</strong>: On-chain data may have delays affecting real-time analysis</li>
                  </ul>
                </div>
                
                <h3 className="text-lg font-semibold mt-4">Ethical Framework</h3>
                <p>
                  Our AI system operates within a strict ethical framework:
                </p>
                <ul>
                  <li><strong>Transparency</strong>: We clearly indicate when information comes from AI</li>
                  <li><strong>Accuracy</strong>: We prioritize factual information and label speculation</li>
                  <li><strong>Responsibility</strong>: We avoid encouraging high-risk financial behavior</li>
                  <li><strong>Privacy</strong>: We minimize data collection and processing</li>
                  <li><strong>Accessibility</strong>: We design for users with varying levels of expertise</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">Safeguards</h3>
                <p>
                  We've implemented several safeguards in our AI system:
                </p>
                <ul>
                  <li>Risk warnings for potentially high-risk suggestions</li>
                  <li>Confidence scores for predictions and analyses</li>
                  <li>Fallback mechanisms when AI confidence is low</li>
                  <li>Regular auditing of AI outputs for bias and accuracy</li>
                  <li>Clear disclaimers about the nature of AI-generated content</li>
                </ul>
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mt-4">
                  <h3 className="text-amber-400 font-semibold">Important Disclaimer</h3>
                  <p className="mt-2">
                    AutoSei's AI features are designed to assist with portfolio management and market analysis, 
                    but all investment decisions should be made based on your own research and judgment. 
                    Cryptocurrency investments carry significant risks, and past performance is not indicative 
                    of future results.
                  </p>
                </div>
                
                <h3 className="text-lg font-semibold mt-4">Continuous Improvement</h3>
                <p>
                  We are committed to continuously improving our AI system:
                </p>
                <ul>
                  <li>Regular updates to models and data sources</li>
                  <li>Ongoing evaluation of accuracy and helpfulness</li>
                  <li>Incorporation of user feedback</li>
                  <li>Adaptation to evolving market conditions and DeFi landscape</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-nebula-400" />
              <CardTitle>AI Capabilities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Natural language portfolio analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Market trend identification and forecasting</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Whale transaction monitoring and analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Risk assessment and diversification suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>DeFi protocol comparison and recommendations</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-nebula-400" />
              <CardTitle>Data Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Real-time Sei blockchain data processing</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Market data from multiple trusted sources</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Historical performance patterns and correlations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>DeFi protocol metrics and performance data</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Secure, privacy-preserving data processing</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-nebula-400" />
              <CardTitle>Usage Guidelines</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Use AI insights as one of many research tools</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Verify important information from multiple sources</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Consider your personal risk tolerance and goals</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Be aware of AI's limitations in predicting markets</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Report any concerning or inaccurate AI responses</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-nebula-400" />
            <CardTitle>Technical Implementation</CardTitle>
          </div>
          <CardDescription>
            How our AI system is integrated into the AutoSei platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p>
              AutoSei's AI capabilities are implemented through a sophisticated architecture that 
              combines cloud-based AI services with local processing:
            </p>
            
            <div className="not-prose bg-cosmic-800 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold text-nebula-400">Architecture Overview</h3>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                    <Code className="h-3 w-3 text-nebula-400" />
                  </div>
                  <div>
                    <span className="font-semibold">Frontend Integration</span>
                    <p className="text-sm text-muted-foreground">
                      AI features are seamlessly integrated into the user interface through React components 
                      and custom hooks that manage AI state and interactions.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                    <Code className="h-3 w-3 text-nebula-400" />
                  </div>
                  <div>
                    <span className="font-semibold">API Layer</span>
                    <p className="text-sm text-muted-foreground">
                      Secure API endpoints handle AI requests, data processing, and response formatting. 
                      This layer manages authentication, rate limiting, and error handling.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                    <Code className="h-3 w-3 text-nebula-400" />
                  </div>
                  <div>
                    <span className="font-semibold">AI Service</span>
                    <p className="text-sm text-muted-foreground">
                      Our core AI service orchestrates interactions with Gemini and other AI models, 
                      handling prompt construction, context management, and response processing.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                    <Code className="h-3 w-3 text-nebula-400" />
                  </div>
                  <div>
                    <span className="font-semibold">Data Pipeline</span>
                    <p className="text-sm text-muted-foreground">
                      A robust data pipeline collects, processes, and enriches blockchain and market data 
                      before it's used by AI models, ensuring high-quality inputs.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">Performance Optimizations</h3>
            <p>
              We've implemented several optimizations to ensure responsive AI interactions:
            </p>
            <ul>
              <li>Response caching for common queries</li>
              <li>Progressive rendering for long-form AI responses</li>
              <li>Parallel data fetching to minimize latency</li>
              <li>Efficient prompt templating to reduce token usage</li>
              <li>Fallback mechanisms for degraded service conditions</li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-4">Future Development</h3>
            <p>
              Our AI system is continuously evolving. Upcoming technical improvements include:
            </p>
            <ul>
              <li>Enhanced personalization through user preference learning</li>
              <li>More sophisticated market prediction models</li>
              <li>Expanded multimodal capabilities (chart analysis, document processing)</li>
              <li>Deeper integration with Sei's unique features and capabilities</li>
              <li>Additional language support for international users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDocumentation;