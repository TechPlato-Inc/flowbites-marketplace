import Link from 'next/link';
import {
  Users,
  MessageSquare,
  Trophy,
  Star,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Palette,
  Code,
} from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Community — Flowbites',
  description:
    'Connect with thousands of template creators and web designers in the Flowbites community. Learn, share, and grow together.',
  alternates: {
    canonical: '/community',
  },
};

const communityStats = [
  { label: 'Community Members', value: '15,000+' },
  { label: 'Templates Shared', value: '2,500+' },
  { label: 'Forum Discussions', value: '8,000+' },
  { label: 'Resources & Tutorials', value: '500+' },
];

const channels = [
  { icon: MessageSquare, title: 'Discussion Forum', description: 'Ask questions, share tips, and connect with other Webflow, Framer, and Wix enthusiasts.', cta: 'Join Discussions' },
  { icon: Palette, title: 'Design Showcase', description: 'Share your latest templates and get feedback from the community. Discover inspiring designs.', cta: 'View Showcase' },
  { icon: Code, title: 'Developer Corner', description: 'Technical discussions about custom code, integrations, APIs, and platform-specific tricks.', cta: 'Explore Topics' },
  { icon: BookOpen, title: 'Learning Hub', description: 'Free tutorials, guides, and resources for Webflow, Framer, and Wix template creation.', cta: 'Start Learning' },
];

const featuredCreators = [
  { name: 'Studio Nova', templates: 45, rating: 4.9, speciality: 'Webflow' },
  { name: 'PixelCraft', templates: 32, rating: 4.8, speciality: 'Framer' },
  { name: 'DesignFlow', templates: 28, rating: 4.9, speciality: 'Webflow' },
  { name: 'UIBridge', templates: 22, rating: 4.7, speciality: 'Wix' },
  { name: 'Framesmith', templates: 38, rating: 4.8, speciality: 'Framer' },
  { name: 'WebCraft Pro', templates: 51, rating: 4.9, speciality: 'Webflow' },
];

const upcomingEvents = [
  { title: 'Template Design Masterclass', date: 'March 5, 2026', type: 'Webinar', description: 'Learn how to create best-selling Webflow templates with pro tips on design, SEO, and performance.' },
  { title: 'Framer Motion Workshop', date: 'March 12, 2026', type: 'Workshop', description: 'Hands-on workshop covering advanced animations and interactions in Framer templates.' },
  { title: 'Flowbites Creator Meetup', date: 'March 20, 2026', type: 'Virtual Meetup', description: 'Monthly meetup for Flowbites creators. Share updates, ask questions, and network.' },
  { title: 'Wix Studio Deep Dive', date: 'April 2, 2026', type: 'Webinar', description: "Exploring Wix Studio's latest features and how to build premium templates with them." },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Flowbites Community</h1>
          <p className="text-lg text-purple-100 max-w-xl mx-auto">
            Connect with thousands of template creators and web designers. Learn, share, and grow together.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {communityStats.map((stat) => (
            <div key={stat.label} className="bg-white border border-neutral-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{stat.value}</p>
              <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Channels */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Community Channels</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {channels.map((ch) => (
            <div key={ch.title} className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <ch.icon className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-neutral-900">{ch.title}</h3>
              </div>
              <p className="text-sm text-neutral-500 mb-4">{ch.description}</p>
              <button className="inline-flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-700">
                {ch.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Creators */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Featured Creators</h2>
            <Link href="/templates" className="text-sm text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuredCreators.map((creator) => (
              <div key={creator.name} className="bg-white border border-neutral-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mx-auto mb-3 flex items-center justify-center text-white font-bold">
                  {creator.name[0]}
                </div>
                <h3 className="font-semibold text-neutral-900">{creator.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">{creator.speciality} Specialist</p>
                <div className="flex items-center justify-center gap-3 mt-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {creator.templates} templates
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" /> {creator.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8">Upcoming Events</h2>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.title} className="border border-neutral-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{event.type}</span>
                  <span className="text-xs text-neutral-400">{event.date}</span>
                </div>
                <h3 className="font-semibold text-neutral-900">{event.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{event.description}</p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium shrink-0">
                Register
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Trophy className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Become a Flowbites Creator</h2>
          <p className="text-purple-100 mb-8 max-w-lg mx-auto">
            Join our creator community, share your templates with the world, and earn money doing what you love.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            Start Creating
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
