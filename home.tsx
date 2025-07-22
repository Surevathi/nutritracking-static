import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Apple, 
  Award, 
  Clock,
  Plus,
  ChartBar,
  Users,
  Settings,
  Heart,
  Activity,
  Trophy,
  Lightbulb,

  Camera
} from "lucide-react";
import { AchievementBadge } from "@/components/achievement-badge";
import { ACHIEVEMENT_DEFINITIONS } from "@shared/achievement-system";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  
  // Get greeting based on time
  const getGreeting = () => {
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Get authenticated user data with localStorage fallback
  const { data: authenticatedUser, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Use authenticated user data or fallback to localStorage
  const currentUser = authenticatedUser as any;

  // Get userId from API or localStorage fallback
  const getUserId = () => {
    if (currentUser?.id) return currentUser.id;
    
    // Fallback to localStorage
    const user = localStorage.getItem("user");
    const storedUser = localStorage.getItem("nutritrack_current_user");
    const actualUser = storedUser ? JSON.parse(storedUser) : user ? JSON.parse(user) : {};
    
    return actualUser.id || null;
  };

  const userId = getUserId();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get today's food logs with localStorage fallback
  const { data: foodLogs = [] } = useQuery({
    queryKey: ["/api/food-logs", userId, today],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/food-logs/user/${userId}?date=${today}`, { 
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        throw new Error('API failed');
      } catch (error) {
        // Fallback to localStorage
        const user = localStorage.getItem("user");
        const currentUser = localStorage.getItem("nutritrack_current_user");
        const actualUser = currentUser ? JSON.parse(currentUser) : user ? JSON.parse(user) : {};
        
        if (actualUser.id) {
          const foodLogsKey = `food_logs_${actualUser.id}_${today}`;
          const localData = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");

          return localData;
        }
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 60000, // Refetch every 60 seconds (1 minute) for updates
  });

  // Get vitamin and mineral status for the current user with proper fallbacks
  const { data: userVitaminStatus } = useQuery({
    queryKey: [`/api/vitamin-status/${userId}`],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/vitamin-status/${userId}`);
        return response;
      } catch (error) {
        // Calculate from localStorage fallback
        const user = localStorage.getItem("user");
        const storedUser = localStorage.getItem("nutritrack_current_user");
        const actualUser = storedUser ? JSON.parse(storedUser) : user ? JSON.parse(user) : {};
        
        if (actualUser.id) {
          const foodLogsKey = `food_logs_${actualUser.id}_${today}`;
          const localFoodLogs = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          
          if (Array.isArray(localFoodLogs) && localFoodLogs.length > 0) {
            // Simple vitamin calculation
            const vitaminLevels: any = {};
            const defaultRDA = {
              vitamin_a: 900, vitamin_c: 90, vitamin_d: 15, vitamin_e: 15, vitamin_k: 120,
              vitamin_b1: 1.2, vitamin_b2: 1.3, vitamin_b3: 16, vitamin_b5: 5, vitamin_b6: 1.3,
              vitamin_b12: 2.4, vitamin_b7: 30, vitamin_b9: 400
            };
            
            Object.keys(defaultRDA).forEach(vitamin => {
              const totalIntake = localFoodLogs.reduce((sum: number, log: any) => {
                if (log.food?.nutrients?.[vitamin]) {
                  return sum + (log.food.nutrients[vitamin] * (parseFloat(log.portionSize || '100') / 100));
                }
                return sum;
              }, 0);
              
              const rda = defaultRDA[vitamin as keyof typeof defaultRDA];
              const percentage = Math.round((totalIntake / rda) * 100);
              let status = 'deficient';
              if (percentage >= 100) status = 'sufficient';
              else if (percentage >= 70) status = 'moderate';
              
              vitaminLevels[vitamin] = { intake: totalIntake, rda, percentage, status };
            });
            
            return { vitaminLevels };
          }
        }
        
        return { vitaminLevels: {} };
      }
    },
    enabled: !!userId,
    refetchInterval: 60000, // Sync with food logs every 60 seconds (1 minute)
  });

  const { data: userMineralStatus } = useQuery({
    queryKey: [`/api/mineral-status/${userId}`],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/mineral-status/${userId}`);
        return response;
      } catch (error) {
        // Calculate from localStorage fallback
        const user = localStorage.getItem("user");
        const storedUser = localStorage.getItem("nutritrack_current_user");
        const actualUser = storedUser ? JSON.parse(storedUser) : user ? JSON.parse(user) : {};
        
        if (actualUser.id) {
          const foodLogsKey = `food_logs_${actualUser.id}_${today}`;
          const localFoodLogs = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          
          if (Array.isArray(localFoodLogs) && localFoodLogs.length > 0) {
            // Simple mineral calculation
            const mineralLevels: any = {};
            const defaultRDA = {
              iron: 8, calcium: 1000, zinc: 11, magnesium: 400, phosphorus: 700,
              potassium: 3500, sodium: 2300, copper: 900, manganese: 2.3, selenium: 55
            };
            
            Object.keys(defaultRDA).forEach(mineral => {
              const totalIntake = localFoodLogs.reduce((sum: number, log: any) => {
                if (log.food?.nutrients?.[mineral]) {
                  return sum + (log.food.nutrients[mineral] * (parseFloat(log.portionSize || '100') / 100));
                }
                return sum;
              }, 0);
              
              const rda = defaultRDA[mineral as keyof typeof defaultRDA];
              const percentage = Math.round((totalIntake / rda) * 100);
              let status = 'deficient';
              if (percentage >= 100) status = 'sufficient';
              else if (percentage >= 70) status = 'moderate';
              
              mineralLevels[mineral] = { intake: totalIntake, rda, percentage, status };
            });
            
            return { mineralLevels };
          }
        }
        
        return { mineralLevels: {} };
      }
    },
    enabled: !!userId,
    refetchInterval: 60000, // Sync with food logs every 60 seconds (1 minute)
  });

  // Get user achievements and progress
  const { data: userProgress } = useQuery({
    queryKey: ["/api/progress", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/progress/${userId}`);
      return response;
    },
    enabled: !!userId,
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["/api/achievements", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/achievements/${userId}`);
      return response;
    },
    enabled: !!userId,
  });

  // Calculate dashboard metrics from food logs
  const vitaminLevels = userVitaminStatus?.vitaminLevels || {};
  const mineralLevels = userMineralStatus?.mineralLevels || {};
  
  // Calculate total calories from food logs with proper nutrient extraction
  const totalCalories = foodLogs.reduce((sum: number, log: any) => {
    const portionSize = parseFloat(log.portionSize || log.quantity || 0);
    const energyKcal = log.food?.nutrients?.energy_kcal || 0;
    const calories = (energyKcal * portionSize) / 100;
    return sum + Math.round(calories);
  }, 0);

  // If we have food logs but no vitamin/mineral levels, calculate directly
  const hasLoggedFood = foodLogs.length > 0;
  let totalNutrients = 0;
  let sufficientNutrients = 0;
  
  if (hasLoggedFood) {
    const vitaminCount = Object.keys(vitaminLevels).length;
    const mineralCount = Object.keys(mineralLevels).length;
    
    if (vitaminCount === 0 && mineralCount === 0) {
      // Direct calculation from food logs
      const defaultVitaminRDA = {
        vitamin_a: 900, vitamin_c: 90, vitamin_d: 15, vitamin_e: 15, vitamin_k: 120,
        vitamin_b1: 1.2, vitamin_b2: 1.3, vitamin_b3: 16, vitamin_b5: 5, vitamin_b6: 1.3,
        vitamin_b12: 2.4, vitamin_b7: 30, vitamin_b9: 400
      };
      
      const defaultMineralRDA = {
        iron: 8, calcium: 1000, zinc: 11, magnesium: 400, phosphorus: 700,
        potassium: 3500, sodium: 2300, copper: 900, manganese: 2.3, selenium: 55
      };
      
      totalNutrients = Object.keys(defaultVitaminRDA).length + Object.keys(defaultMineralRDA).length;
      
      // Calculate sufficient nutrients from food logs
      const allNutrients = { ...defaultVitaminRDA, ...defaultMineralRDA };
      sufficientNutrients = 0;
      
      Object.keys(allNutrients).forEach(nutrient => {
        const totalIntake = foodLogs.reduce((sum: number, log: any) => {
          if (log.food?.nutrients?.[nutrient]) {
            const portionMultiplier = parseFloat(log.portionSize || '1');
            return sum + (log.food.nutrients[nutrient] * portionMultiplier);
          }
          return sum;
        }, 0);
        
        const rda = allNutrients[nutrient as keyof typeof allNutrients];
        const percentage = (totalIntake / rda) * 100;
        // Use 80% threshold for sufficient (consistent with rest of system) 
        // and count moderate (50%) as 0.5 for better scoring
        if (percentage >= 80) {
          sufficientNutrients++;
        } else if (percentage >= 50) {
          sufficientNutrients += 0.5; // Moderate status gets half credit
        }
      });
    } else {
      // Use API data with proper scoring
      totalNutrients = vitaminCount + mineralCount;
      const sufficientCount = [
        ...Object.values(vitaminLevels).filter((v: any) => v.status === 'sufficient'),
        ...Object.values(mineralLevels).filter((m: any) => m.status === 'sufficient')
      ].length;
      const moderateCount = [
        ...Object.values(vitaminLevels).filter((v: any) => v.status === 'moderate'),
        ...Object.values(mineralLevels).filter((m: any) => m.status === 'moderate')
      ].length;
      // Include moderate nutrients with half credit for better scoring
      sufficientNutrients = sufficientCount + (moderateCount * 0.5);
    }
  }
  
  const displaySufficient = hasLoggedFood ? sufficientNutrients : 0;
  const displayTotal = hasLoggedFood ? Math.max(totalNutrients, 2) : 2; // Show at least 2 for proper display



  // Check for new achievements
  const checkAchievementsMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/achievements/${userId}/check`),
    onSuccess: (newAchievements: any) => {
      if (Array.isArray(newAchievements) && newAchievements.length > 0) {
        newAchievements.forEach((achievement: any) => {
          const achievementDef = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievement.achievementId);
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievementDef?.name || achievement.achievementId}`,
          });
        });
        queryClient.invalidateQueries({ queryKey: ["/api/achievements", userId] });
        queryClient.invalidateQueries({ queryKey: ["/api/progress", userId] });
      }
    },
  });

  const nutritionScore = totalNutrients > 0 ? Math.round((sufficientNutrients / totalNutrients) * 100) : 0;
  
  // Remove debug logs for production
  // console.log('Nutrition Score Calculation:', {
  //   sufficientNutrients: sufficientNutrients.toFixed(1),
  //   totalNutrients,
  //   nutritionScore: nutritionScore + '%'
  // });
  


  // Quick action cards
  const quickActions = [
    {
      title: "Log Food",
      description: "Add your meals and snacks",
      icon: Plus,
      href: "/food-log",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "View Analysis",
      description: "Check your nutrition insights",
      icon: ChartBar,
      href: "/analysis",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Dashboard",
      description: "Detailed nutrition tracking",
      icon: Activity,
      href: "/dashboard",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "Health Goals",
      description: "Set and track your goals",
      icon: Target,
      href: "/health-goals",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 rounded-2xl p-8 md:p-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                🌱 Personalized Nutrition
              </Badge>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                📊 Smart Analytics
              </Badge>
              <Badge className="bg-orange-200 text-orange-900 hover:bg-orange-200">
                🎯 Goal Tracking
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              👋 {getGreeting()},<br />
              <span className="text-orange-600">{currentUser?.username || 'User'}</span>!
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 max-w-2xl">
              Transform your health with intelligent nutrition tracking. Get personalized insights, 
              track vitamins & minerals & macronutrients, and achieve your wellness goals with data-driven precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/food-log">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Start Tracking Today
                </Button>
              </Link>
              <Link href="/analysis">
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-3 text-lg">
                  <ChartBar className="h-5 w-5 mr-2" />
                  View My Analytics
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual Elements */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Central Food Icon */}
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Apple className="h-16 w-16 text-orange-600" />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center animate-bounce shadow-md">
                <Target className="h-8 w-8 text-orange-700" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-200 rounded-full flex items-center justify-center animate-pulse shadow-md">
                <TrendingUp className="h-8 w-8 text-red-700" />
              </div>
              
              <div className="absolute top-8 -left-12 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              
              <div className="absolute bottom-8 -right-12 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              
              {/* Orbiting Elements */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                <div className="relative w-full h-full">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-200 rounded-full"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-200 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-200 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-purple-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-200/30 to-transparent rounded-full blur-3xl"></div>
        
        {/* Floating Icons for Mobile */}
        <div className="lg:hidden absolute top-4 right-4 space-y-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-orange-200">
            <Heart className="h-4 w-4 text-red-600" />
          </div>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-orange-200">
            <Target className="h-4 w-4 text-orange-600" />
          </div>
        </div>
      </div>



      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <Apple className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Logs</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(foodLogs) ? foodLogs.length : 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <Target className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nutrition Score</p>
              <p className="text-2xl font-bold text-gray-900">{nutritionScore}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-200 rounded-lg">
              <Award className="h-6 w-6 text-orange-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-gray-900">
                {displaySufficient}/{totalNutrients > 0 ? totalNutrients : 23}
              </p>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Did You Know Section */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Lightbulb className="w-5 h-5" />
            Did You Know?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DidYouKnowFacts vitaminData={userVitaminStatus} mineralData={userMineralStatus} />
        </CardContent>
      </Card>

      {/* NHS Food Suggestions Notice */}
      <Card className="bg-gradient-to-r from-orange-50 via-red-50 to-orange-100 border-orange-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Apple className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                🍎 Personalized NHS Food Suggestions Available!
              </h3>
              <p className="text-orange-800 mb-3">
                Visit the <strong>Dashboard</strong> to discover intelligent food recommendations based on your daily nutrition logs. 
                Our system analyzes your current intake and suggests NHS-approved foods to help you meet your vitamin, 
                mineral, and macronutrient targets.
              </p>
              <Link href="/dashboard">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  View Food Suggestions
                  <ChartBar className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-orange-800 mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className={`cursor-pointer transition-colors ${action.color}`}>
                <CardContent className="flex items-center p-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm">
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Progress */}
      {nutritionScore > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Today's Nutrition Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Nutrition Score</span>
              <Badge variant={nutritionScore >= 80 ? "default" : nutritionScore >= 60 ? "secondary" : "destructive"}>
                {nutritionScore}%
              </Badge>
            </div>
            <Progress value={nutritionScore} className="w-full" />
            <p className="text-sm text-gray-600">
              {nutritionScore >= 80 
                ? "Excellent! You're meeting most of your nutritional goals."
                : nutritionScore >= 60 
                ? "Good progress! Consider adding more nutrient-rich foods."
                : "Keep going! Log more foods to improve your nutrition score."
              }
            </p>
          </CardContent>
        </Card>
      )}



      {/* Recent Activity */}
      {foodLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Food Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foodLogs.slice(0, 3).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{log.food?.name || 'Unknown Food'}</p>
                    <p className="text-sm text-gray-600">
                      {log.mealType} • {log.portionSize}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Just now'}
                  </Badge>
                </div>
              ))}
              {foodLogs.length > 3 && (
                <Link href="/food-log">
                  <Button variant="outline" className="w-full">
                    View All Food Logs ({foodLogs.length})
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {foodLogs.length === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="text-center p-8">
            <Apple className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your Nutrition Journey
            </h3>
            <p className="text-gray-600 mb-4">
              Log your first meal to begin tracking your nutrition and get personalized insights.
            </p>
            <Link href="/food-log">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Meal
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}



    </div>
  );
}

// Did You Know Facts Component
function DidYouKnowFacts({ vitaminData, mineralData }: { vitaminData: any, mineralData: any }) {
  const nutritionFacts = [
    // Vitamin Facts
    {
      fact: "Your body can't store Vitamin C, so you need it daily! It's water-soluble and gets flushed out regularly.",
      icon: "🍊",
      category: "vitamin"
    },
    {
      fact: "Vitamin D is actually a hormone, not just a vitamin! Your skin produces it when exposed to sunlight.",
      icon: "☀️",
      category: "vitamin"
    },
    {
      fact: "Folate (B9) is crucial for DNA synthesis. That's why it's so important during pregnancy for proper fetal development.",
      icon: "🤰",
      category: "vitamin"
    },
    {
      fact: "Vitamin K helps your blood clot properly. That's why people on blood thinners need to monitor their leafy green intake!",
      icon: "🥬",
      category: "vitamin"
    },
    {
      fact: "B12 is the only vitamin that contains a metal - cobalt! It's also the largest and most complex vitamin molecule.",
      icon: "🧬",
      category: "vitamin"
    },
    {
      fact: "Vitamin A deficiency is the leading cause of preventable blindness in children worldwide.",
      icon: "👁️",
      category: "vitamin"
    },
    {
      fact: "Thiamine (B1) deficiency can cause beriberi, a disease that affects the heart and nervous system.",
      icon: "💓",
      category: "vitamin"
    },
    {
      fact: "Riboflavin (B2) gives your urine its bright yellow color when you take B-complex vitamins!",
      icon: "💛",
      category: "vitamin"
    },
    {
      fact: "Niacin (B3) can cause a harmless but alarming 'niacin flush' - temporary redness and warmth in your face.",
      icon: "🔥",
      category: "vitamin"
    },
    {
      fact: "Pantothenic acid (B5) is found in almost every food - its name means 'from everywhere' in Greek!",
      icon: "🌍",
      category: "vitamin"
    },
    {
      fact: "Pyridoxine (B6) is essential for making neurotransmitters like serotonin and dopamine.",
      icon: "🧠",
      category: "vitamin"
    },
    {
      fact: "Biotin (B7) deficiency is rare because gut bacteria produce some of it for you!",
      icon: "🦠",
      category: "vitamin"
    },
    {
      fact: "Vitamin E is actually a family of 8 different compounds, not just one vitamin!",
      icon: "🔬",
      category: "vitamin"
    },
    {
      fact: "Fat-soluble vitamins (A, D, E, K) can be stored in your body fat and liver for months.",
      icon: "💾",
      category: "vitamin"
    },
    {
      fact: "Water-soluble vitamins (B vitamins and C) need to be replenished regularly as they're not stored.",
      icon: "💧",
      category: "vitamin"
    },
    {
      fact: "Vitamin C is essential for collagen production - without it, your skin literally falls apart (scurvy).",
      icon: "🍋",
      category: "vitamin"
    },
    {
      fact: "Beta-carotene converts to Vitamin A in your body, but only as much as you need!",
      icon: "🥕",
      category: "vitamin"
    },
    {
      fact: "Vitamin D3 (from sunlight) is more effective than D2 (from plants) at raising blood levels.",
      icon: "🌞",
      category: "vitamin"
    },
    {
      fact: "Your liver can store enough Vitamin A to last you 1-2 years without any dietary intake!",
      icon: "🏪",
      category: "vitamin"
    },
    {
      fact: "Folic acid in supplements is more bioavailable than natural folate from foods.",
      icon: "💊",
      category: "vitamin"
    },
    {
      fact: "Vitamin K2 is better for bone health than K1, and it's found in fermented foods like natto.",
      icon: "🦴",
      category: "vitamin"
    },
    {
      fact: "Choline, while not officially a vitamin, is essential and most people don't get enough!",
      icon: "🥚",
      category: "vitamin"
    },
    {
      fact: "Vitamin B12 deficiency can take years to develop because your liver stores 3-5 years worth!",
      icon: "⏰",
      category: "vitamin"
    },
    {
      fact: "Smoking destroys Vitamin C - smokers need 35mg more per day than non-smokers.",
      icon: "🚭",
      category: "vitamin"
    },
    {
      fact: "Vitamin D deficiency affects over 1 billion people worldwide, even in sunny countries!",
      icon: "🌐",
      category: "vitamin"
    },

    // Mineral Facts
    {
      fact: "Iron from meat (heme iron) is absorbed 2-3 times better than iron from plants. Combine plant iron with Vitamin C for better absorption!",
      icon: "🥩",
      category: "mineral"
    },
    {
      fact: "One Brazil nut contains your entire daily selenium requirement! But don't eat too many - selenium toxicity is real.",
      icon: "🌰",
      category: "mineral"
    },
    {
      fact: "Calcium absorption is only about 30% efficient. Your body carefully regulates how much it takes in based on current needs.",
      icon: "🦴",
      category: "mineral"
    },
    {
      fact: "Zinc is involved in over 300 enzyme reactions in your body - from immune function to wound healing!",
      icon: "⚡",
      category: "mineral"
    },
    {
      fact: "Your body contains about 4-7 grams of iron total, with 70% of it in your red blood cells carrying oxygen.",
      icon: "🩸",
      category: "mineral"
    },
    {
      fact: "Magnesium is involved in over 600 enzymatic reactions in your body - it's truly essential!",
      icon: "✨",
      category: "mineral"
    },
    {
      fact: "Potassium is crucial for heart rhythm - too little or too much can be life-threatening.",
      icon: "💓",
      category: "mineral"
    },
    {
      fact: "Sodium and potassium work together like a cellular pump - you need both in proper balance.",
      icon: "⚖️",
      category: "mineral"
    },
    {
      fact: "Iodine deficiency is the world's leading cause of preventable mental retardation.",
      icon: "🧠",
      category: "mineral"
    },
    {
      fact: "Chromium helps insulin work more effectively, but most people get very little from food.",
      icon: "🍯",
      category: "mineral"
    },
    {
      fact: "Copper is essential for iron absorption - deficiency can cause anemia even with adequate iron!",
      icon: "🔶",
      category: "mineral"
    },
    {
      fact: "Manganese is crucial for bone formation and wound healing, but deficiency is extremely rare.",
      icon: "🦴",
      category: "mineral"
    },
    {
      fact: "Molybdenum helps process sulfur-containing amino acids and is found in legumes.",
      icon: "🫘",
      category: "mineral"
    },
    {
      fact: "Phosphorus works with calcium for bone health - 85% of your body's phosphorus is in bones and teeth.",
      icon: "🦷",
      category: "mineral"
    },
    {
      fact: "Sulfur is found in every cell of your body and gives garlic and onions their distinctive smell!",
      icon: "🧄",
      category: "mineral"
    },
    {
      fact: "Fluoride strengthens tooth enamel but too much can cause dental fluorosis (white spots on teeth).",
      icon: "🦷",
      category: "mineral"
    },
    {
      fact: "Boron may help with calcium and magnesium metabolism, though it's not officially essential.",
      icon: "💎",
      category: "mineral"
    },
    {
      fact: "Silicon is important for bone and connective tissue health, found in whole grains and beer!",
      icon: "🌾",
      category: "mineral"
    },
    {
      fact: "Vanadium may have diabetes-fighting properties, but research is still ongoing.",
      icon: "🔬",
      category: "mineral"
    },
    {
      fact: "Nickel is found in many foods but serves no known function in humans - it may actually be toxic.",
      icon: "⚠️",
      category: "mineral"
    },
    {
      fact: "Cobalt is only needed as part of Vitamin B12 - pure cobalt is actually toxic to humans.",
      icon: "🧬",
      category: "mineral"
    },
    {
      fact: "Iron overload (hemochromatosis) affects 1 in 200 people and can damage organs over time.",
      icon: "🚨",
      category: "mineral"
    },
    {
      fact: "Calcium from dairy is not necessarily better absorbed than calcium from leafy greens!",
      icon: "🥬",
      category: "mineral"
    },
    {
      fact: "Magnesium deficiency is surprisingly common, affecting up to 50% of people in developed countries.",
      icon: "😮",
      category: "mineral"
    },
    {
      fact: "Zinc deficiency can cause loss of taste and smell - it's crucial for these senses!",
      icon: "👃",
      category: "mineral"
    },

    // General Nutrition Facts
    {
      fact: "Your brain uses about 20% of your daily calories despite being only 2% of your body weight!",
      icon: "🧠",
      category: "general"
    },
    {
      fact: "Fiber feeds your gut bacteria, which produce vitamins like K2 and some B vitamins for you!",
      icon: "🦠",
      category: "general"
    },
    {
      fact: "Antioxidants work as a team - taking isolated antioxidant supplements can actually be harmful.",
      icon: "👥",
      category: "general"
    },
    {
      fact: "Your taste buds regenerate every 1-2 weeks, which is why you can develop new food preferences!",
      icon: "👅",
      category: "general"
    },
    {
      fact: "Spicy foods don't actually burn your tongue - capsaicin tricks your pain receptors!",
      icon: "🌶️",
      category: "general"
    },
    {
      fact: "Dark chocolate contains more antioxidants per gram than blueberries or acai berries!",
      icon: "🍫",
      category: "general"
    },
    {
      fact: "Your stomach acid is strong enough to dissolve metal, but mucus protects your stomach lining.",
      icon: "🛡️",
      category: "general"
    },
    {
      fact: "Carrots were originally purple! Orange carrots were developed in the Netherlands in the 17th century.",
      icon: "🥕",
      category: "general"
    },
    {
      fact: "Honey never spoils - archaeologists have found edible honey in ancient Egyptian tombs!",
      icon: "🍯",
      category: "general"
    },
    {
      fact: "Bananas are berries, but strawberries aren't! Botanically speaking, berries must have seeds inside.",
      icon: "🍌",
      category: "general"
    },
    {
      fact: "Almonds aren't nuts - they're seeds from the almond fruit, related to peaches and apricots!",
      icon: "🌰",
      category: "general"
    },
    {
      fact: "Rhubarb leaves are toxic due to oxalic acid, but the stalks are perfectly safe to eat.",
      icon: "☠️",
      category: "general"
    },
    {
      fact: "Tomatoes have more lycopene when cooked than raw - heat breaks down cell walls!",
      icon: "🍅",
      category: "general"
    },
    {
      fact: "Avocados don't ripen on the tree - they only ripen after being picked!",
      icon: "🥑",
      category: "general"
    },
    {
      fact: "Cashews are never sold in their shells because the shell contains urushiol - the same toxin as poison ivy!",
      icon: "🥜",
      category: "general"
    },
    {
      fact: "Pineapples contain bromelain, an enzyme that breaks down protein - it's literally digesting your mouth!",
      icon: "🍍",
      category: "general"
    },
    {
      fact: "Cranberries bounce when ripe - that's how farmers test their quality!",
      icon: "🫐",
      category: "general"
    },
    {
      fact: "Kale, broccoli, cauliflower, and Brussels sprouts are all the same species - just different cultivars!",
      icon: "🥦",
      category: "general"
    },
    {
      fact: "Vanilla is the second most expensive spice after saffron - it takes 3-4 years to mature!",
      icon: "🌺",
      category: "general"
    },
    {
      fact: "Apples float in water because they're 25% air - that's why bobbing for apples works!",
      icon: "🍎",
      category: "general"
    },
    {
      fact: "Oranges aren't naturally orange - in tropical climates, they stay green even when ripe!",
      icon: "🍊",
      category: "general"
    },
    {
      fact: "Mushrooms are more closely related to animals than plants - they don't photosynthesize!",
      icon: "🍄",
      category: "general"
    },
    {
      fact: "Watermelons are 92% water, making them one of the most hydrating foods you can eat!",
      icon: "🍉",
      category: "general"
    },
    {
      fact: "Coconut water is sterile and has been used as IV fluid in emergency situations!",
      icon: "🥥",
      category: "general"
    },
    {
      fact: "Lemons contain more sugar than strawberries - but you can't taste it because of the citric acid!",
      icon: "🍋",
      category: "general"
    },

    // Metabolism & Digestion Facts
    {
      fact: "Your metabolism doesn't significantly slow down until age 60 - weight gain is usually due to decreased activity.",
      icon: "⚡",
      category: "metabolism"
    },
    {
      fact: "Muscle tissue burns 3 times more calories at rest than fat tissue - strength training boosts metabolism!",
      icon: "💪",
      category: "metabolism"
    },
    {
      fact: "Your digestive system is technically outside your body - it's a tube that runs through you!",
      icon: "🔄",
      category: "metabolism"
    },
    {
      fact: "Stomach rumbling (borborygmi) happens when air and fluid move through your intestines - not just when hungry!",
      icon: "🔊",
      category: "metabolism"
    },
    {
      fact: "Your liver performs over 500 different functions, including making bile, processing nutrients, and detoxifying blood.",
      icon: "🏭",
      category: "metabolism"
    },
    {
      fact: "The 'thermic effect of food' means you burn calories just digesting food - protein burns the most!",
      icon: "🔥",
      category: "metabolism"
    },
    {
      fact: "Your pancreas produces about 1.5 liters of digestive juice daily to break down food.",
      icon: "💧",
      category: "metabolism"
    },
    {
      fact: "Gastric acid has a pH of 1.5-3.5 - nearly as acidic as battery acid!",
      icon: "⚗️",
      category: "metabolism"
    },
    {
      fact: "Your small intestine is about 20 feet long but coiled up to fit in your abdomen!",
      icon: "🌀",
      category: "metabolism"
    },
    {
      fact: "The surface area of your small intestine is about the size of a tennis court due to villi!",
      icon: "🎾",
      category: "metabolism"
    },
    {
      fact: "Bile is recycled - 95% of bile salts are reabsorbed and reused up to 12 times per day!",
      icon: "♻️",
      category: "metabolism"
    },
    {
      fact: "Your gallbladder can concentrate bile up to 10 times by removing water from it.",
      icon: "🎈",
      category: "metabolism"
    },
    {
      fact: "Peristalsis (muscle contractions) moves food through your digestive tract - that's why astronauts can eat in zero gravity!",
      icon: "🚀",
      category: "metabolism"
    },
    {
      fact: "Your stomach stretches to hold up to 4 liters of food and liquid - about the size of a football!",
      icon: "🏈",
      category: "metabolism"
    },
    {
      fact: "Digestive enzymes are so powerful they would digest your organs if not for protective mucus!",
      icon: "🛡️",
      category: "metabolism"
    },

    // Hydration & Water Facts
    {
      fact: "Your brain is 73% water - even 2% dehydration can affect concentration and mood!",
      icon: "🧠",
      category: "hydration"
    },
    {
      fact: "You lose about 2.5 liters of water daily through breathing, sweating, and urination.",
      icon: "💨",
      category: "hydration"
    },
    {
      fact: "Thirst is a late indicator of dehydration - you're already 1-2% dehydrated when you feel thirsty!",
      icon: "🚰",
      category: "hydration"
    },
    {
      fact: "Dark urine usually indicates dehydration, while pale yellow suggests good hydration.",
      icon: "🟡",
      category: "hydration"
    },
    {
      fact: "Caffeinated drinks do count toward fluid intake - caffeine's diuretic effect is mild and temporary.",
      icon: "☕",
      category: "hydration"
    },
    {
      fact: "You can absorb about 8-10 ounces of fluid per hour during exercise - drinking more can cause stomach upset.",
      icon: "🏃",
      category: "hydration"
    },
    {
      fact: "Electrolytes (sodium, potassium) help your body retain water - plain water isn't always best for rehydration.",
      icon: "⚡",
      category: "hydration"
    },
    {
      fact: "Your kidneys filter about 50 gallons of blood daily to produce 1-2 quarts of urine!",
      icon: "🔄",
      category: "hydration"
    },
    {
      fact: "Alcohol inhibits antidiuretic hormone, causing increased urination and dehydration.",
      icon: "🍷",
      category: "hydration"
    },
    {
      fact: "Older adults have a reduced sense of thirst and are at higher risk for dehydration.",
      icon: "👴",
      category: "hydration"
    },

    // Macronutrient Facts
    {
      fact: "Protein provides 4 calories per gram, the same as carbohydrates, while fat provides 9 calories per gram.",
      icon: "🔢",
      category: "macronutrient"
    },
    {
      fact: "Your body can make 11 of the 20 amino acids - the other 9 'essential' amino acids must come from food.",
      icon: "🧱",
      category: "macronutrient"
    },
    {
      fact: "Saturated fat isn't necessarily bad - your body makes it naturally and uses it for hormone production!",
      icon: "🧈",
      category: "macronutrient"
    },
    {
      fact: "Trans fats are the only fats with no known health benefits - they're banned in many countries.",
      icon: "🚫",
      category: "macronutrient"
    },
    {
      fact: "Omega-3 and omega-6 fatty acids compete for the same enzymes - balance matters more than total amount!",
      icon: "⚖️",
      category: "macronutrient"
    },
    {
      fact: "Complex carbohydrates provide sustained energy, while simple carbs give quick energy spikes.",
      icon: "📊",
      category: "macronutrient"
    },
    {
      fact: "Fiber is a carbohydrate your body can't digest - but your gut bacteria love it!",
      icon: "🦠",
      category: "macronutrient"
    },
    {
      fact: "Protein synthesis happens constantly - you need amino acids available throughout the day.",
      icon: "🔄",
      category: "macronutrient"
    },
    {
      fact: "Ketones are an alternative fuel source your brain can use when glucose is scarce.",
      icon: "🧠",
      category: "macronutrient"
    },
    {
      fact: "Essential fatty acids (omega-3 and omega-6) must come from food - your body can't make them.",
      icon: "🐟",
      category: "macronutrient"
    },

    // Food Safety & Storage Facts
    {
      fact: "The 'danger zone' for food safety is 40-140°F (4-60°C) - bacteria multiply rapidly in this range!",
      icon: "🌡️",
      category: "safety"
    },
    {
      fact: "Freezing doesn't kill bacteria - it just puts them to sleep until food thaws!",
      icon: "🥶",
      category: "safety"
    },
    {
      fact: "Expiration dates on most foods are about quality, not safety - many foods are safe well past these dates.",
      icon: "📅",
      category: "safety"
    },
    {
      fact: "Color isn't a reliable indicator of doneness in meat - use a thermometer for safety!",
      icon: "🌡️",
      category: "safety"
    },
    {
      fact: "Cross-contamination causes more foodborne illness than undercooked food - wash those cutting boards!",
      icon: "🧽",
      category: "safety"
    },
    {
      fact: "Room temperature perishable foods should be refrigerated within 2 hours (1 hour if over 90°F outside).",
      icon: "⏰",
      category: "safety"
    },
    {
      fact: "Washing raw chicken actually spreads bacteria around your kitchen - just cook it properly!",
      icon: "🚫",
      category: "safety"
    },
    {
      fact: "Acidic foods (tomatoes, citrus) can leach metals from cans - but it's usually not harmful in normal amounts.",
      icon: "🥫",
      category: "safety"
    },
    {
      fact: "Botulism from home canning is rare but serious - always follow tested recipes and proper procedures!",
      icon: "⚠️",
      category: "safety"
    },
    {
      fact: "Honey should never be given to infants under 12 months due to botulism risk from spores.",
      icon: "👶",
      category: "safety"
    },

    // Historical & Cultural Nutrition Facts
    {
      fact: "Scurvy killed more sailors than warfare until they discovered citrus fruits prevent it!",
      icon: "⚓",
      category: "history"
    },
    {
      fact: "Pellagra (niacin deficiency) was common in the American South until corn fortification began.",
      icon: "🌽",
      category: "history"
    },
    {
      fact: "The first vitamin (thiamine/B1) was discovered in 1912 by studying beriberi in rice-eating populations.",
      icon: "🍚",
      category: "history"
    },
    {
      fact: "Milk pasteurization reduced tuberculosis transmission and saved countless lives.",
      icon: "🥛",
      category: "history"
    },
    {
      fact: "Iodized salt was introduced in the 1920s to prevent goiter - a major public health success!",
      icon: "🧂",
      category: "history"
    },
    {
      fact: "The Mediterranean diet got its name from a 1950s study, but people have eaten this way for millennia!",
      icon: "🫒",
      category: "history"
    },
    {
      fact: "Inuit peoples traditionally got Vitamin C from raw whale skin and seal meat - no scurvy despite no plants!",
      icon: "🐋",
      category: "history"
    },
    {
      fact: "Rice polishing machines caused beriberi epidemics in Asia by removing thiamine-rich bran.",
      icon: "🍚",
      category: "history"
    },
    {
      fact: "The Irish Potato Famine wasn't just about potatoes - it was also about over-reliance on a single food source.",
      icon: "🥔",
      category: "history"
    },
    {
      fact: "Spices were once worth more than gold - they preserved food and masked the taste of spoilage!",
      icon: "🌶️",
      category: "history"
    },

    // Modern Nutrition Science Facts
    {
      fact: "Nutrigenomics studies how your genes affect your response to nutrients - personalized nutrition is becoming reality!",
      icon: "🧬",
      category: "science"
    },
    {
      fact: "Your gut microbiome is unique as a fingerprint and affects everything from immunity to mood!",
      icon: "🔬",
      category: "science"
    },
    {
      fact: "Epigenetics shows that what you eat can influence which genes are turned on or off!",
      icon: "🧬",
      category: "science"
    },
    {
      fact: "The gut-brain axis means your digestive system can influence your thoughts and emotions!",
      icon: "💭",
      category: "science"
    },
    {
      fact: "Chronobiology research shows that when you eat may be as important as what you eat!",
      icon: "⏰",
      category: "science"
    },
    {
      fact: "Blue zones (areas with exceptional longevity) share common dietary patterns despite different foods!",
      icon: "🌍",
      category: "science"
    },
    {
      fact: "Polyphenols in colorful fruits and vegetables act as prebiotics, feeding beneficial gut bacteria!",
      icon: "🌈",
      category: "science"
    },
    {
      fact: "Intermittent fasting may trigger autophagy - your cells' 'cleaning and recycling' process!",
      icon: "🔄",
      category: "science"
    },
    {
      fact: "The microbiome-gut-brain axis suggests that gut bacteria may influence depression and anxiety!",
      icon: "🧠",
      category: "science"
    },
    {
      fact: "Nutrient density per calorie varies enormously - kale has 1000x more nutrition per calorie than soda!",
      icon: "📊",
      category: "science"
    },

    // Exercise & Nutrition Facts
    {
      fact: "Post-workout protein synthesis is elevated for 24-48 hours - not just the first few hours!",
      icon: "💪",
      category: "exercise"
    },
    {
      fact: "Carbohydrate loading only benefits exercise lasting longer than 90 minutes at high intensity.",
      icon: "🏃",
      category: "exercise"
    },
    {
      fact: "Chocolate milk is an effective post-workout recovery drink due to its 3:1 carb-to-protein ratio!",
      icon: "🥛",
      category: "exercise"
    },
    {
      fact: "Dehydration of just 2% can reduce exercise performance by 10-15%!",
      icon: "💧",
      category: "exercise"
    },
    {
      fact: "Beetroot juice can improve endurance performance due to nitrates that enhance oxygen efficiency!",
      icon: "🫐",
      category: "exercise"
    },
    {
      fact: "Caffeine is one of the few legal performance enhancers - it can improve endurance by 3-5%!",
      icon: "☕",
      category: "exercise"
    },
    {
      fact: "Protein timing isn't as important as total daily protein intake for muscle building.",
      icon: "⏰",
      category: "exercise"
    },
    {
      fact: "Creatine is the most researched sports supplement and can improve high-intensity exercise performance!",
      icon: "⚡",
      category: "exercise"
    },
    {
      fact: "Your muscles can store about 400-500g of glycogen - that's roughly 1600-2000 calories of fuel!",
      icon: "🔋",
      category: "exercise"
    },
    {
      fact: "Branch-chain amino acids (BCAAs) are less effective than complete protein for muscle building!",
      icon: "🧱",
      category: "exercise"
    },

    // Surprising Nutrition Facts
    {
      fact: "Celery doesn't have 'negative calories' - that's a myth. It still provides about 6 calories per stalk!",
      icon: "🥬",
      category: "myth"
    },
    {
      fact: "MSG (monosodium glutamate) is naturally found in tomatoes, cheese, and mushrooms!",
      icon: "🍄",
      category: "myth"
    },
    {
      fact: "Organic doesn't always mean more nutritious - nutrient content depends more on soil and growing conditions!",
      icon: "🌱",
      category: "myth"
    },
    {
      fact: "Detox diets aren't necessary - your liver and kidneys detox your body 24/7 naturally!",
      icon: "🫘",
      category: "myth"
    },
    {
      fact: "Breakfast being 'the most important meal' was largely a marketing slogan from cereal companies!",
      icon: "🥣",
      category: "myth"
    },
    {
      fact: "Sea salt and table salt have virtually the same sodium content - despite different marketing claims!",
      icon: "🧂",
      category: "myth"
    },
    {
      fact: "Raw foods aren't always more nutritious - cooking can increase bioavailability of some nutrients!",
      icon: "🔥",
      category: "myth"
    },
    {
      fact: "Superfoods are a marketing term - no single food provides all nutrients you need!",
      icon: "🦸",
      category: "myth"
    },
    {
      fact: "Eating fat doesn't make you fat - excess calories from any source can lead to weight gain!",
      icon: "🥑",
      category: "myth"
    },
    {
      fact: "Natural doesn't always mean safe - many deadly poisons are completely natural!",
      icon: "☠️",
      category: "myth"
    }
  ];

  // Get personalized facts based on user's nutritional status
  const getPersonalizedFacts = () => {
    const personalizedFacts: typeof nutritionFacts = [];
    
    // Check for vitamin deficiencies and add relevant facts
    if (vitaminData) {
      const deficientVitamins = Object.entries(vitaminData)
        .filter(([key, data]: [string, any]) => 
          key !== 'userId' && key !== 'date' && data?.status === 'deficient'
        );
      
      if (deficientVitamins.some(([vitamin]) => vitamin.includes('C'))) {
        personalizedFacts.push(nutritionFacts[0]);
      }
      if (deficientVitamins.some(([vitamin]) => vitamin.includes('D'))) {
        personalizedFacts.push(nutritionFacts[2]);
      }
      if (deficientVitamins.some(([vitamin]) => vitamin.includes('K'))) {
        personalizedFacts.push(nutritionFacts[6]);
      }
      if (deficientVitamins.some(([vitamin]) => vitamin.includes('B9') || vitamin.includes('folate'))) {
        personalizedFacts.push(nutritionFacts[4]);
      }
      if (deficientVitamins.some(([vitamin]) => vitamin.includes('B12'))) {
        personalizedFacts.push(nutritionFacts[8]);
      }
    }

    // Check for mineral deficiencies and add relevant facts
    if (mineralData) {
      const deficientMinerals = Object.entries(mineralData)
        .filter(([key, data]: [string, any]) => 
          key !== 'userId' && key !== 'date' && data?.status === 'deficient'
        );
      
      if (deficientMinerals.some(([mineral]) => mineral.includes('iron'))) {
        personalizedFacts.push(nutritionFacts[1]);
        personalizedFacts.push(nutritionFacts[9]);
      }
      if (deficientMinerals.some(([mineral]) => mineral.includes('selenium'))) {
        personalizedFacts.push(nutritionFacts[3]);
      }
      if (deficientMinerals.some(([mineral]) => mineral.includes('calcium'))) {
        personalizedFacts.push(nutritionFacts[5]);
      }
      if (deficientMinerals.some(([mineral]) => mineral.includes('zinc'))) {
        personalizedFacts.push(nutritionFacts[7]);
      }
    }

    // If no personalized facts, return random selection
    if (personalizedFacts.length === 0) {
      const shuffled = [...nutritionFacts].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2);
    }

    // Return personalized facts with some random ones if needed
    const shuffledPersonalized = [...personalizedFacts].sort(() => 0.5 - Math.random());
    if (shuffledPersonalized.length < 2) {
      const remaining = nutritionFacts.filter(fact => !personalizedFacts.includes(fact));
      const shuffledRemaining = remaining.sort(() => 0.5 - Math.random());
      return [...shuffledPersonalized, ...shuffledRemaining].slice(0, 2);
    }
    
    return shuffledPersonalized.slice(0, 2);
  };

  const displayedFacts = getPersonalizedFacts();

  return (
    <div className="space-y-4">
      {displayedFacts.map((fact, index) => (
        <div key={index} className="flex items-start gap-3 p-4 bg-white/80 rounded-lg border border-orange-100">
          <div className="text-2xl flex-shrink-0">{fact.icon}</div>
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed">{fact.fact}</p>
            <Badge variant="outline" className="mt-2 text-xs border-orange-200 text-orange-700">
              {fact.category === 'vitamin' ? 'Vitamin Fact' : 'Mineral Fact'}
            </Badge>
          </div>
        </div>
      ))}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          💡 Refresh to see different nutrition facts!
        </p>
      </div>
    </div>
  );
}