
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Heart, AlertCircle, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ForumPost {
  id: number;
  author: string;
  title: string;
  content: string;
  date: Date;
  replies: number;
  likes: number;
  tags: string[];
}

const SAMPLE_POSTS: ForumPost[] = [
  {
    id: 1,
    author: "BlueJay42",
    title: "Dealing with exam anxiety",
    content: "I'm really struggling with anxiety before exams. My heart races and I can't focus. Does anyone have any tips that have worked for them?",
    date: new Date(Date.now() - 1000000),
    replies: 8,
    likes: 12,
    tags: ["Anxiety", "Student Life"]
  },
  {
    id: 2,
    author: "SunflowerGirl",
    title: "Making friends as an introvert",
    content: "I find it really difficult to make new friends at college. I'm naturally introverted and get overwhelmed in large groups...",
    date: new Date(Date.now() - 3000000),
    replies: 15,
    likes: 24,
    tags: ["Social Anxiety", "Relationships"]
  },
  {
    id: 3,
    author: "MountainHiker",
    title: "Balancing studies and mental health",
    content: "I've been pushing myself too hard with my coursework and I'm starting to feel burnt out. How do you all manage to balance academics and self-care?",
    date: new Date(Date.now() - 6000000),
    replies: 11,
    likes: 18,
    tags: ["Burnout", "Self-Care", "Student Life"]
  }
];

const POPULAR_TAGS = [
  "Anxiety", "Depression", "Self-Care", "Student Life", 
  "Relationships", "Stress", "Sleep", "Motivation"
];

const ForumPage: React.FC = () => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-poppins font-semibold mb-6 text-sage">Support Forum</h1>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search forums..." className="pl-9" />
        </div>
        <Button className="bg-peach text-charcoal hover:bg-peach/90">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-poppins font-semibold mb-4">Recent Discussions</h2>
          
          <div className="space-y-4">
            {SAMPLE_POSTS.map((post) => (
              <Card key={post.id} className="card-mental overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">@{post.author}</span>
                      <span className="text-muted-foreground text-xs">{formatDate(post.date)}</span>
                    </div>
                    <h3 className="text-lg font-medium my-1">{post.title}</h3>
                  </div>
                  
                  <p className="text-sm mb-3 line-clamp-2">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 bg-lavender/20 text-lavender/90 dark:bg-lavender/30 dark:text-lavender/95 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 h-8">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.replies}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 h-8">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button variant="outline">Load More</Button>
          </div>
        </div>
        
        <div>
          <Card className="card-mental mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-sage" />
                Community Guidelines
              </h3>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p>• Be respectful and kind to all members</p>
                <p>• Do not share personal identifying information</p>
                <p>• Use content warnings for sensitive topics</p>
                <p>• Remember this is peer support, not professional advice</p>
              </div>
              <Button className="w-full mt-4 bg-sage hover:bg-sage/90">
                View Full Guidelines
              </Button>
            </CardContent>
          </Card>
          
          <Card className="card-mental">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <Button 
                    key={tag} 
                    variant="outline" 
                    size="sm" 
                    className="bg-lavender/10 border-lavender/20 hover:bg-lavender/20"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
