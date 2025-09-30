import { BsLightningChargeFill } from 'react-icons/bs';
import '../index.css'
import { TrendingUp, Shield, Code, Users, BarChart3, Zap, Target, Trophy, ArrowRight, DollarSign, LineChart, Bot, Star, ChevronRight, Play, Sparkles } from "lucide-react";
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-1">
              <div className="gradient-bg p-2 rounded-lg">
                <BsLightningChargeFill className="h-8 w-8 text-white bg-emerald-500 p-1.25 rounded" />
              </div>
              <span className="text-3xl font-bold font-montserrat text-emerald-500 ">Flux</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-all hover:scale-105 transform hover:text-emerald-600">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 transform hover:text-emerald-600">How It Works</a>
              <a href="#community" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 transform hover:text-emerald-600">Community</a>
              <Link to="/login" className="hover:bg-emerald-50 hover:border-emerald-600 duration-300 border-2 flex items-center border-gray-200 transition-colors px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40">Sign In</Link>
              <Link to="/signup" className="bg-emerald-600 border-2 border-emerald-500 hover:opacity-90 shadow-lg px-3 py-1.5 rounded-md text-sm font-medium text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        {/* Modern Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/15 via-emerald-500/20 to-cyan-500/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl floating-animation opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl floating-animation opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl floating-animation opacity-60" style={{ animationDelay: '4s' }}></div>

        <div className="container mx-auto text-center relative z-10">
          <div className="glass-card px-6 py-3 rounded-full mb-8 inline-block fade-in-up">
            <div className="relative flex items-center gap-2  rounded-2xl text-lg border bg-white/10 border-emerald-500/20 backdrop-blur-xl shadow-2xl px-4 py-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className=" text-green-600">Free & Open Source Platform</span>
            </div>
          </div>
          <h1 className="font-lato font-bold text-4xl mb-10 fade-in-up stagger-1">
            <span className="text-transparent text-8xl font-[1000] bg-clip-text bg-gradient-to-r from-emerald-900 to-emerald-600">Master Trading Without</span>
            <br /><br />
            <span className="gradient-text font-[900] mt-10 text-7xl animated-gradient text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Financial Risk</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed fade-in-up stagger-2 font-light">
            The extensible virtual trading platform where students learn, experiment, and compete.
            Test your strategies, build custom algorithms, and join a thriving community of traders.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 fade-in-up stagger-3">
            <Link to="/signup" className=" bg-gradient-to-r shadow-xl from-emerald-600 to-emerald-500 text-white text-lg h-16 px-12 inline-flex items-center justify-center font-medium rounded-2xl cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary/40">
              <Play className="mr-2 h-5 w-5" />
              Start Trading Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/login" className="text-lg text-black bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl px-12 hover:bg-white/20 hover:border-white/30 transition-all duration-300 inline-flex items-center justify-center font-medium rounded-2xl cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <BarChart3 className="mr-2 h-5 w-5" />
              View Live Demo
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm fade-in-up stagger-4">
            <div className="glass-card bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-black drop-shadow-sm">
                  $100K Virtual Balance
                </span>
              </div>
            </div>

            <div className="glass-card bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="font-medium text-black drop-shadow-sm">
                  Risk-Free Learning
                </span>
              </div>
            </div>

            <div className="glass-card bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-cyan-400" />
                <span className="font-medium text-black drop-shadow-sm">
                  Algorithmic Trading
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="modern-card px-6 py-2 rounded-full mb-8 inline-block">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">Powerful Features</span>
              </div>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight">
              Built for <span className="gradient-text">Modern Trading</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to learn, practice, and excel in financial markets with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            <div className="glass-card p-10 card-hover border-0 floating-card fade-in-up stagger-1 rounded-3xl">
              <div className="p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl w-fit">
                  <BarChart3 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Real-Time Market Data</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Interactive candlestick charts with OHLC data from live market APIs. Smart caching ensures optimal performance and respects rate limits.
                </p>
              </div>
            </div>

            <div className="glass-card p-10 card-hover border-0 floating-card fade-in-up stagger-2 rounded-3xl">
              <div className="p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-3xl w-fit">
                  <Target className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Virtual Trading Engine</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Execute buy/sell orders with $100K virtual balance. Comprehensive portfolio tracking, P&L analysis, and complete trading history.
                </p>
              </div>
            </div>

            <div className="glass-card p-10 card-hover border-0 floating-card fade-in-up stagger-3 rounded-3xl">
              <div className="p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-3xl w-fit">
                  <Bot className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Algorithmic Strategies</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Build and deploy custom trading algorithms via our pluggable API. Connect external models with simple JSON schema.
                </p>
              </div>
            </div>

            <div className="glass-card p-10 card-hover border-0 floating-card fade-in-up stagger-4 rounded-3xl">
              <div className="p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-3xl w-fit">
                  <LineChart className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Advanced Backtesting</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Test strategies against historical data with comprehensive performance metrics. Optimize your approach with detailed analytics.
                </p>
              </div>
            </div>

            <div className="glass-card p-10 card-hover border-0 floating-card fade-in-up stagger-5 rounded-3xl">
              <div className="p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-3xl w-fit">
                  <Trophy className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Trading Competitions</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Join community-hosted competitions with customizable rules. Compete with traders worldwide and climb the leaderboards.
                </p>
              </div>
            </div>

            <div className="glass-card p-10 card-hover border-0 floating-card fade-in-up stagger-6 rounded-3xl">
              <div className="p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-pink-500/20 to-rose-500/10 rounded-3xl w-fit">
                  <Zap className="h-10 w-10 text-pink-500" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Performance Analytics</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Comprehensive performance metrics, risk analysis, and detailed reporting for data-driven trading decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl font-bold mb-8 gradient-text leading-tight">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get started in minutes and begin your journey to trading mastery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="modern-button w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-all duration-500 rounded-3xl">
                1
              </div>
              <h3 className="text-3xl font-bold mb-6">Sign Up & Get Balance</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Create your account instantly and receive $100,000 in virtual currency to start trading without any financial risk.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-all duration-500 rounded-3xl">
                2
              </div>
              <h3 className="text-3xl font-bold mb-6">Trade & Experiment</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Explore real-time market data, analyze interactive charts, and execute manual or algorithmic trades with confidence.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-all duration-500 rounded-3xl">
                3
              </div>
              <h3 className="text-3xl font-bold mb-6">Analyze & Compete</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Track performance with advanced analytics, backtest strategies, and participate in thrilling community competitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="modern-card px-6 py-2 rounded-full mb-8 inline-block">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Community Driven</span>
            </div>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight">
            Join the Trading <span className="gradient-text">Revolution</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-20 max-w-3xl mx-auto leading-relaxed">
            Connect with passionate traders, share strategies, and participate in competitions that push your skills to the limit
          </p>

          <div className="grid md:grid-cols-3 gap-10 mb-16">
            <div className="glass-card p-10 card-hover border-0 floating-card rounded-3xl text-center">
              <div className="text-center p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl w-fit mx-auto">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Community Competitions</h3>
                <p className="text-lg leading-relaxed">
                  Host and join trading competitions with customizable rules, timeframes, and prizes. Test your skills against the best.
                </p>
              </div>
            </div>

            <div className="glass-card p-10 card-hover border-0 floating-card rounded-3xl text-center">
              <div className="text-center p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-3xl w-fit mx-auto">
                  <Code className="h-12 w-12 text-emerald-500" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Strategy Marketplace</h3>
                <p className="text-lg leading-relaxed">
                  Share your algorithmic strategies, discover new approaches, and collaborate with fellow developers and traders.
                </p>
              </div>
            </div>

            <div className="glass-card p-10 card-hover border-0 floating-card rounded-3xl text-center">
              <div className="text-center p-0">
                <div className="mb-8 p-5 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-3xl w-fit mx-auto">
                  <Trophy className="h-12 w-12 text-purple-500" />
                </div>
                <h3 className="text-2xl mb-6 font-semibold">Global Leaderboards</h3>
                <p className="text-lg leading-relaxed">
                  Compete for top positions, showcase your trading performance, and earn recognition in the global trading community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-cyan-500/10"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl floating-animation"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl floating-animation" style={{ animationDelay: '2s' }}></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="modern-card p-16 rounded-3xl">
              <h2 className="text-5xl sm:text-6xl font-bold mb-10 leading-tight">
                Ready to <span className="gradient-text">Master Trading</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of students who are learning to trade safely with virtual currency. Start building your trading expertise today.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Link to="/signup" className="modern-button text-lg h-16 px-12 inline-flex items-center justify-center font-medium rounded-2xl cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <Play className="mr-2 h-6 w-6" />
                  Create Free Account
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Link>
                <Link to="/login" className="text-lg h-16 px-12 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 inline-flex items-center justify-center font-medium rounded-2xl cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <Code className="mr-2 h-6 w-6" />
                  View Documentation
                </Link>
              </div>
              <div className="flex justify-center items-center flex-wrap gap-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">Start in 30 Seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-muted/10 to-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="gradient-bg p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Flux</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2025 Flux. Built for Inter IIT Tech Meet 14.0 Prepathon<br />
              <span className="text-sm">IIT (BHU) Varanasi • Empowering the next generation of traders</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;