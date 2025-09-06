import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Camera, 
  Shield,
  Award,
  ArrowRight,
  Play,
  Star,
  Smartphone,
  Globe,
  Zap,
  Heart,
  Quote
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Camera className="h-12 w-12 text-blue-600" />,
      title: 'Report Issues',
      description: 'Easily report civic problems with photos and location data',
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      icon: <MapPin className="h-12 w-12 text-green-600" />,
      title: 'Interactive Map',
      description: 'View and track issues in your community on an interactive map',
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      icon: <Users className="h-12 w-12 text-purple-600" />,
      title: 'Community Driven',
      description: 'Collaborate with neighbors and local authorities to solve problems',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-emerald-600" />,
      title: 'Track Progress',
      description: 'Monitor the status of reported issues from submission to resolution',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      icon: <Award className="h-12 w-12 text-yellow-600" />,
      title: 'Gamification',
      description: 'Earn points and badges for contributing to your community',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      icon: <Shield className="h-12 w-12 text-red-600" />,
      title: 'Verified Reports',
      description: 'Community validation ensures authentic and accurate reporting',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    }
  ];

  const stats = [
    { label: 'Issues Reported', value: '2,847', icon: <TrendingUp className="h-8 w-8" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Issues Resolved', value: '1,923', icon: <CheckCircle className="h-8 w-8" />, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Active Users', value: '5,432', icon: <Users className="h-8 w-8" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Communities', value: '127', icon: <MapPin className="h-8 w-8" />, color: 'text-orange-600', bgColor: 'bg-orange-50' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Community Leader',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      quote: 'This platform has transformed how our community addresses local issues. We\'ve seen a 40% increase in problem resolution!'
    },
    {
      name: 'Mike Chen',
      role: 'Local Resident',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      quote: 'Finally, a way to report issues that actually gets results. The gamification keeps me engaged and motivated.'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'City Council Member',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      quote: 'The data and insights from this platform help us prioritize and allocate resources more effectively.'
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Spot an Issue',
      description: 'Notice a problem in your community that needs attention',
      icon: <Camera className="h-8 w-8 text-blue-600" />,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      step: '02',
      title: 'Report & Document',
      description: 'Take photos and provide details about the issue location',
      icon: <Smartphone className="h-8 w-8 text-green-600" />,
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      step: '03',
      title: 'Community Action',
      description: 'Local authorities and community members collaborate on solutions',
      icon: <Users className="h-8 w-8 text-purple-600" />,
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      step: '04',
      title: 'Problem Solved',
      description: 'Track progress and celebrate when issues are resolved',
      icon: <CheckCircle className="h-8 w-8 text-emerald-600" />,
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <div className="w-12 h-12 bg-white bg-opacity-10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <MapPin className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="w-14 h-14 bg-white bg-opacity-10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Users className="h-7 w-7 text-white" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
                Civic Problem
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Solver
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl animate-slide-up">
                Empowering communities to identify, report, and resolve civic issues together. 
                Make your voice heard and help build a better neighborhood.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Community collaboration"
                  className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-semibold animate-pulse">
                  <Star className="inline h-4 w-4 mr-1" />
                  Trusted by 127 Communities
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute top-8 left-8 w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl opacity-20 -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Making Real Impact</h2>
            <p className="text-xl text-gray-600">See how communities are transforming with our platform</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center p-6 rounded-2xl ${stat.bgColor} transform hover:scale-105 transition-all duration-200`}>
                <div className={`flex justify-center ${stat.color} mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to make a difference in your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-blue-600 text-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      {step.icon}
                      <h3 className="text-xl font-semibold text-gray-900 ml-3">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
                {/* Connection line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300 z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create positive change in your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What People Are Saying
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from real communities making a difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 relative">
                <Quote className="h-8 w-8 text-blue-600 mb-4" />
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens working together to improve their communities. 
            Start reporting issues and be part of the solution today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 inline-flex items-center justify-center shadow-lg"
            >
              <Heart className="mr-2 h-5 w-5" />
              Start Reporting Issues
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 inline-flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Civic Problem Solver</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering communities through technology to create positive change and solve civic issues together.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Users className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Register</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-3">
                <p className="text-gray-400 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  support@civicproblem.com
                </p>
                <p className="text-gray-400 flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  (555) 123-4567
                </p>
                <p className="text-gray-400 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  New York, NY
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Civic Problem Solver. All rights reserved. Made with <Heart className="inline h-4 w-4 text-red-500" /> for communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;