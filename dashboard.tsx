import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VitaminStatusCard } from "@/components/vitamin-status-card";
import { MineralStatusCard } from "@/components/mineral-status-card";
import { MacronutrientStatusCard } from "@/components/macronutrient-status-card";
import { SymptomAnalysis } from "@/components/symptom-analysis";
import { NutritionInsights } from "@/components/nutrition-insights";
import { NutritionSourceBadge } from "@/components/nutrition-source-badge";
import { NutrientInteractions } from "@/components/nutrient-interactions";
import { FoodSearchModal } from "@/components/food-search-modal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronUp, Calendar, Shield, Heart, TriangleAlert, CircleAlert, Plus, Save, Download, FileText, History, Trash2, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getHealthGoalProgress, getFoodRecommendations, calculateMineralIntake } from "@/lib/vitamin-calculator";
import { generateClientSideFoodSuggestions } from "@/lib/food-suggestions";
import { HEALTH_GOALS_DATA, calculateGoalProgress } from "../../../shared/health-goals-data";
import { useCountryNutrition } from "@/hooks/useCountryNutrition";

// Helper function to calculate vitamin status from food logs
function calculateVitaminStatusFromFoodLogs(foodLogs: any[], user: any, countryVitamins: any) {
  const vitaminLevels: any = {};
  
  // Use country-specific RDA values
  const defaultRDA = countryVitamins || {
    vitamin_a: 900,
    vitamin_c: 90,
    vitamin_d: 15,
    vitamin_e: 15,
    vitamin_k: 120,
    vitamin_b1: 1.2,
    vitamin_b2: 1.3,
    vitamin_b3: 16,
    vitamin_b5: 5,
    vitamin_b6: 1.3,
    vitamin_b12: 2.4,
    vitamin_b7: 30,
    vitamin_b9: 400
  };

  // Calculate total intake from all food logs
  const totalIntake: any = {};
  Object.keys(defaultRDA).forEach(vitamin => {
    totalIntake[vitamin] = 0;
  });

  foodLogs.forEach(log => {
    if (log.food && log.food.nutrients) {
      const nutrients = log.food.nutrients;
      const portionMultiplier = parseFloat(log.portionSize || '1'); // Direct multiplier
      
      Object.keys(defaultRDA).forEach(vitamin => {
        let value = nutrients[vitamin];
        
        // Handle backward compatibility for old field names
        if (!value && vitamin === 'vitamin_b7') {
          value = nutrients['biotin'];
        } else if (!value && vitamin === 'vitamin_b9') {
          value = nutrients['folate'];
        }
        
        if (value) {
          totalIntake[vitamin] += value * portionMultiplier;
        }
      });
    }
  });

  // Calculate percentages and status
  Object.keys(defaultRDA).forEach(vitamin => {
    const intake = totalIntake[vitamin];
    const rda = defaultRDA[vitamin as keyof typeof defaultRDA];
    const percentage = Math.round((intake / rda) * 100);
    
    let status = 'deficient';
    if (percentage >= 100) status = 'sufficient';
    else if (percentage >= 70) status = 'moderate';
    
    vitaminLevels[vitamin] = {
      intake: Math.round(intake * 100) / 100,
      rda,
      percentage,
      status,
      foodSources: foodLogs.map(log => {
        let amount = log.food?.nutrients?.[vitamin];
        
        // Handle backward compatibility for old field names
        if (!amount && vitamin === 'vitamin_b7') {
          amount = log.food?.nutrients?.['biotin'];
        } else if (!amount && vitamin === 'vitamin_b9') {
          amount = log.food?.nutrients?.['folate'];
        }
        
        const finalAmount = (amount || 0) * parseFloat(log.portionSize || '1');
        return {
          food: log.food?.name || 'Unknown',
          amount: finalAmount,
          percentage: Math.round((finalAmount / rda) * 100)
        };
      }).filter(source => source.amount > 0)
    };
  });

  return { vitaminLevels };
}

// Helper function to calculate mineral status from food logs
function calculateMineralStatusFromFoodLogs(foodLogs: any[], user: any, countryMinerals: any) {
  const mineralLevels: any = {};
  
  // Use country-specific RDA values
  const defaultRDA = countryMinerals || {
    iron: 8,
    calcium: 1000,
    zinc: 11,
    magnesium: 400,
    phosphorus: 700,
    potassium: 3500,
    sodium: 2300,
    copper: 900,
    manganese: 2.3,
    selenium: 55
  };

  // Calculate total intake from all food logs
  const totalIntake: any = {};
  Object.keys(defaultRDA).forEach(mineral => {
    totalIntake[mineral] = 0;
  });

  foodLogs.forEach(log => {
    if (log.food && log.food.nutrients) {
      const nutrients = log.food.nutrients;
      const portionMultiplier = parseFloat(log.portionSize || '1'); // Direct multiplier
      
      Object.keys(defaultRDA).forEach(mineral => {
        if (nutrients[mineral]) {
          totalIntake[mineral] += nutrients[mineral] * portionMultiplier;
        }
      });
    }
  });

  // Calculate percentages and status
  Object.keys(defaultRDA).forEach(mineral => {
    const intake = totalIntake[mineral];
    const rda = defaultRDA[mineral as keyof typeof defaultRDA];
    const percentage = Math.round((intake / rda) * 100);
    
    let status = 'deficient';
    if (percentage >= 100) status = 'sufficient';
    else if (percentage >= 70) status = 'moderate';
    
    mineralLevels[mineral] = {
      intake: Math.round(intake * 100) / 100,
      rda,
      percentage,
      status,
      foodSources: foodLogs.map(log => ({
        food: log.food?.name || 'Unknown',
        amount: log.food?.nutrients?.[mineral] * parseFloat(log.portionSize || '1') || 0,
        percentage: Math.round(((log.food?.nutrients?.[mineral] * parseFloat(log.portionSize || '1') || 0) / rda) * 100)
      })).filter(source => source.amount > 0)
    };
  });

  return { mineralLevels };
}

// Helper function to calculate macro status from food logs
function calculateMacroStatusFromFoodLogs(foodLogs: any[], user: any) {
  const macroIntake = {
    energy: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };

  const macroTargets = {
    energy: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
    fiber: 25
  };

  // Calculate total intake from all food logs
  foodLogs.forEach(log => {
    if (log.food && log.food.nutrients) {
      const nutrients = log.food.nutrients;
      const portionMultiplier = parseFloat(log.portionSize || '1');
      
      if (nutrients.energy_kcal) {
        macroIntake.energy += nutrients.energy_kcal * portionMultiplier;
      }
      if (nutrients.protein) {
        macroIntake.protein += nutrients.protein * portionMultiplier;
      }
      if (nutrients.carbohydrate_by_difference) {
        macroIntake.carbs += nutrients.carbohydrate_by_difference * portionMultiplier;
      }
      if (nutrients.total_lipid_fat) {
        macroIntake.fat += nutrients.total_lipid_fat * portionMultiplier;
      }
      if (nutrients.fiber_total_dietary) {
        macroIntake.fiber += nutrients.fiber_total_dietary * portionMultiplier;
      }
    }
  });

  // Calculate percentages
  const macroPercentages = {
    energy: Math.round((macroIntake.energy / macroTargets.energy) * 100),
    protein: Math.round((macroIntake.protein / macroTargets.protein) * 100),
    carbs: Math.round((macroIntake.carbs / macroTargets.carbs) * 100),
    fat: Math.round((macroIntake.fat / macroTargets.fat) * 100),
    fiber: Math.round((macroIntake.fiber / macroTargets.fiber) * 100)
  };

  return {
    intake: macroIntake,
    targets: macroTargets,
    percentages: macroPercentages
  };
}

const MEAL_TYPES = [
  { id: "breakfast", name: "Breakfast", icon: "🌅" },
  { id: "lunch", name: "Lunch", icon: "☀️" },
  { id: "dinner", name: "Dinner", icon: "🌙" },
  { id: "snack", name: "Snacks", icon: "🍎" },
];

export default function Dashboard() {
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [showAllVitamins, setShowAllVitamins] = useState(false);
  const [showAllMinerals, setShowAllMinerals] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  const { toast } = useToast();
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    recommendations: false,
    priorityNutrients: false,
    nutritionStandards: false,
    symptomAnalysis: false,
    nutrientInteractions: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  // Get current user data with localStorage fallback
  const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    const currentUser = localStorage.getItem("nutritrack_current_user");
    return currentUser ? JSON.parse(currentUser) : user ? JSON.parse(user) : null;
  };

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
    queryFn: () => fetch("/api/user", { credentials: 'include' }).then(res => res.json()),
  });

  const actualUser = currentUser || getCurrentUser();
  const userId = actualUser?.id;
  
  // Get country-specific nutrition standards
  const countryNutrition = useCountryNutrition(actualUser);

  const { data: vitaminStatus, refetch: refetchVitaminStatus } = useQuery({
    queryKey: ["/api/vitamin-status", userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/vitamin-status/${userId}?date=${today}`, { 
          credentials: 'include'
        });
        if (response.ok) {
          return await response.json();
        }
        throw new Error('API failed');
      } catch (error) {
        console.log("Dashboard vitamin status API failed, calculating from localStorage...");
        
        // Calculate vitamin status from localStorage food logs
        const user = getCurrentUser();

        
        if (user?.id) {
          const foodLogsKey = `food_logs_${user.id}_${today}`;
          const localFoodLogs = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          
          console.log('Dashboard vitamin - using key:', foodLogsKey);
          console.log('Dashboard vitamin - found logs:', localFoodLogs.length);
          console.log('Dashboard vitamin - food logs data:', localFoodLogs);
          
          if (Array.isArray(localFoodLogs) && localFoodLogs.length > 0) {
            const vitaminCalculation = calculateVitaminStatusFromFoodLogs(localFoodLogs, user, countryNutrition.vitamins);
            console.log('Dashboard vitamin - calculated result:', vitaminCalculation);
            return vitaminCalculation;
          }
        }
        
        // Return default empty structure with all vitamins at 0%
        return {
          vitaminLevels: {
            vitamin_a: { intake: 0, rda: 900, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_c: { intake: 0, rda: 90, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_d: { intake: 0, rda: 15, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_e: { intake: 0, rda: 15, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_k: { intake: 0, rda: 120, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_b1: { intake: 0, rda: 1.2, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_b2: { intake: 0, rda: 1.3, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_b3: { intake: 0, rda: 16, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_b5: { intake: 0, rda: 5, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_b6: { intake: 0, rda: 1.3, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_b12: { intake: 0, rda: 2.4, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_b7: { intake: 0, rda: 30, percentage: 0, status: 'deficient', foodSources: [] },
            vitamin_b9: { intake: 0, rda: 400, percentage: 0, status: 'deficient', foodSources: [] }
          }
        };
      }
    },
    enabled: !!userId,
  });

  const { data: mineralStatus, refetch: refetchMineralStatus } = useQuery({
    queryKey: ["/api/mineral-status", userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/mineral-status/${userId}?date=${today}`, { 
          credentials: 'include'
        });
        if (response.ok) {
          return await response.json();
        }
        throw new Error('API failed');
      } catch (error) {
        console.log("Dashboard mineral status API failed, calculating from localStorage...");
        
        // Calculate mineral status from localStorage food logs
        const user = getCurrentUser();

        
        if (user?.id) {
          const foodLogsKey = `food_logs_${user.id}_${today}`;
          const localFoodLogs = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          
          console.log('Dashboard mineral - using key:', foodLogsKey);
          console.log('Dashboard mineral - found logs:', localFoodLogs.length);
          console.log('Dashboard mineral - food logs data:', localFoodLogs);
          
          if (Array.isArray(localFoodLogs) && localFoodLogs.length > 0) {
            const mineralCalculation = calculateMineralStatusFromFoodLogs(localFoodLogs, user, countryNutrition.minerals);
            console.log('Dashboard mineral - calculated result:', mineralCalculation);
            return mineralCalculation;
          }
        }
        
        // Return default empty structure with all minerals at 0%
        return {
          mineralLevels: {
            iron: { intake: 0, rda: 8, percentage: 0, status: 'deficient', foodSources: [] },
            calcium: { intake: 0, rda: 1000, percentage: 0, status: 'deficient', foodSources: [] },
            zinc: { intake: 0, rda: 11, percentage: 0, status: 'deficient', foodSources: [] },
            magnesium: { intake: 0, rda: 400, percentage: 0, status: 'deficient', foodSources: [] },
            phosphorus: { intake: 0, rda: 700, percentage: 0, status: 'deficient', foodSources: [] },
            potassium: { intake: 0, rda: 3500, percentage: 0, status: 'deficient', foodSources: [] },
            sodium: { intake: 0, rda: 2300, percentage: 0, status: 'deficient', foodSources: [] },
            copper: { intake: 0, rda: 900, percentage: 0, status: 'deficient', foodSources: [] },
            manganese: { intake: 0, rda: 2.3, percentage: 0, status: 'deficient', foodSources: [] },
            selenium: { intake: 0, rda: 55, percentage: 0, status: 'deficient', foodSources: [] }
          }
        };
      }
    },
    enabled: !!userId,
  });

  const { data: foodLogs = [], refetch: refetchFoodLogs } = useQuery({
    queryKey: ["/api/food-logs", "user", userId],
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
        console.log("Dashboard API food logs failed, trying localStorage fallback...");
        
        // Fallback to localStorage
        const user = localStorage.getItem("user");
        const currentUser = localStorage.getItem("nutritrack_current_user");
        const actualUser = currentUser ? JSON.parse(currentUser) : user ? JSON.parse(user) : {};
        
        if (actualUser.id) {
          const foodLogsKey = `food_logs_${actualUser.id}_${today}`;
          const localData = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          console.log("Dashboard localStorage food logs:", localData);
          return Array.isArray(localData) ? localData : [];
        }
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 60000, // Refetch every 60 seconds (1 minute) for dashboard updates
  });

  const { data: savedSnapshots = [], refetch: refetchSnapshots } = useQuery({
    queryKey: ["/api/dashboard-snapshots", userId],
    enabled: !!userId && showSnapshots,
  });

  const vitaminLevels = vitaminStatus?.vitaminLevels || {};
  const mineralLevels = mineralStatus?.mineralLevels || {};

  // Generate intelligent food suggestions based on nutritional gaps
  const foodSuggestions = generateClientSideFoodSuggestions(vitaminLevels, mineralLevels);

  // Calculate comprehensive nutrition stats from both vitamins and minerals
  const totalVitamins = 13;
  const vitaminOnTrack = Object.values(vitaminLevels).filter((v: any) => v.status === 'sufficient').length;
  const vitaminModerate = Object.values(vitaminLevels).filter((v: any) => v.status === 'moderate').length;
  const vitaminDeficient = Object.values(vitaminLevels).filter((v: any) => v.status === 'deficient').length;

  const totalMinerals = 10;
  const mineralOnTrack = Object.values(mineralLevels).filter((m: any) => m.status === 'sufficient').length;
  const mineralModerate = Object.values(mineralLevels).filter((m: any) => m.status === 'moderate').length;
  const mineralDeficient = Object.values(mineralLevels).filter((m: any) => m.status === 'deficient').length;

  // Combined stats for overall progress tracking
  const totalNutrients = totalVitamins + totalMinerals;
  const totalOnTrack = vitaminOnTrack + mineralOnTrack;
  const totalModerate = vitaminModerate + mineralModerate;
  const totalDeficient = vitaminDeficient + mineralDeficient;
  
  // FIXED: Include moderate status in progress calculation for better scoring
  const progressiveScore = totalOnTrack + mineralOnTrack;
  const dailyProgress = totalNutrients > 0 ? Math.round(((totalOnTrack + (totalModerate * 0.5)) / totalNutrients) * 100) : 0;



  // Get NHS-integrated recommendations based on both vitamin and mineral deficiencies
  const recommendations = getFoodRecommendations(vitaminLevels, mineralLevels);

  // Calculate health goal progress using authentic medical data
  // Save & Export functionality
  const saveDashboardSnapshot = async () => {
    try {
      // Calculate meaningful snapshot statistics
      const totalVitamins = Object.keys(vitaminLevels).length;
      const sufficientVitamins = Object.values(vitaminLevels).filter((v: any) => v.status === 'sufficient').length;
      const totalMinerals = Object.keys(mineralLevels).length;
      const sufficientMinerals = Object.values(mineralLevels).filter((m: any) => m.status === 'sufficient').length;
      const dailyProgress = Math.round(((sufficientVitamins + sufficientMinerals) / (totalVitamins + totalMinerals)) * 100);

      const dashboardData = {
        date: today,
        userId: userId,
        foodLogs: foodLogs.map((log: any) => ({
          id: log.id,
          foodName: log.foodName || log.food?.name || 'Unknown Food',
          mealType: log.mealType || 'Unknown meal',
          quantity: parseFloat(log.portionSize) || 100,
          unit: 'g',
          calories: log.food?.nutrients?.energy || 0
        })),
        vitaminStatus: vitaminStatus,
        mineralStatus: mineralStatus,
        summary: {
          totalVitamins,
          sufficientVitamins,
          totalMinerals, 
          sufficientMinerals,
          dailyProgress,
          totalFoodEntries: foodLogs.length,
          totalNutrients: totalVitamins + totalMinerals,
          totalOnTrack: sufficientVitamins + sufficientMinerals
        },
        timestamp: new Date().toISOString()
      };

      // Save to backend
      await apiRequest("POST", "/api/dashboard-snapshots", dashboardData);
      
      // Refresh snapshots if they're being shown
      if (showSnapshots) {
        refetchSnapshots();
      }
      
      toast({
        title: "Dashboard Saved",
        description: "Your dashboard snapshot has been saved successfully.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save dashboard snapshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete dashboard snapshot
  const deleteSnapshot = async (snapshotId: number) => {
    try {
      await apiRequest("DELETE", `/api/dashboard-snapshots/${snapshotId}`);
      refetchSnapshots();
      toast({
        title: "Snapshot Deleted",
        description: "Dashboard snapshot deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete snapshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  // View snapshot details
  const viewSnapshotDetails = (snapshot: any) => {
    console.log("Debug - Selected snapshot:", snapshot);
    console.log("Debug - Snapshot data:", snapshot.snapshotData);
    setSelectedSnapshot(snapshot);
  };

  // Export dashboard as PDF report
  const exportDashboardPDF = () => {
    const reportContent = `
VitaMinTrack Dashboard Report
Generated: ${new Date().toLocaleDateString()}
User: ${currentUser?.username || 'User'}

NUTRITION SUMMARY
=================
Overall Progress: ${dailyProgress}%
Total Nutrients Tracked: ${totalNutrients}
Nutrients On Track: ${totalOnTrack}
Nutrients Need Attention: ${totalDeficient + totalModerate}

VITAMIN STATUS
==============
${Object.entries(vitaminLevels).map(([vitamin, data]: [string, any]) => 
  `${vitamin}: ${data.percentage}% (${data.status})`
).join('\n')}

MINERAL STATUS
==============
${Object.entries(mineralLevels).map(([mineral, data]: [string, any]) => 
  `${mineral}: ${data.percentage}% (${data.status})`
).join('\n')}

FOOD LOGS (${today})
===================
${foodLogs.map((log: any) => 
  `${log.food?.name || 'Unknown'} - ${log.quantity}g (${log.mealType})`
).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutritracking-report-${today}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Dashboard report exported successfully.",
    });
  };

  const goalProgress = HEALTH_GOALS_DATA.slice(0, 4).map(goal => ({
    goal: goal.id,
    name: goal.name,
    progress: calculateGoalProgress(goal, vitaminLevels, mineralLevels),
    category: goal.category,
    icon: goal.category === 'immunity' ? Shield : 
          goal.category === 'beauty' ? Heart :
          goal.category === 'energy' ? Shield :
          goal.category === 'bone' ? Shield : Heart
  }));

  const handleFoodAdded = () => {
    refetchVitaminStatus();
    refetchMineralStatus();
    refetchFoodLogs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-orange-50 to-pink-50" style={{
      background: 'linear-gradient(135deg, #fff5f5 0%, #fef7ed 25%, #fdf2f8 50%, #fff1f2 75%, #fef7ed 100%)'
    }}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Track your daily nutrition and health goals</p>
            {actualUser && (
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  📍 Your nutrition standards are personalized for your gender ({countryNutrition.gender}) and country ({countryNutrition.countryName}) using official health authority guidelines
                </p>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 font-black px-10 py-4 text-xl border-4 border-red-800 transform hover:scale-110 ring-4 ring-red-300 ring-opacity-50"
                size="lg"
              >
                <Plus className="mr-3 h-7 w-7 font-bold" />
                ADD FOOD
                <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {MEAL_TYPES.map((mealType) => (
                <DropdownMenuItem
                  key={mealType.id}
                  onClick={() => {
                    setSelectedMealType(mealType.id);
                    setIsAddFoodOpen(true);
                  }}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <span className="text-lg">{mealType.icon}</span>
                  <span>{mealType.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>



        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Daily Progress</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{dailyProgress}%</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-green-600" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">On Track</p>
                  <div className="flex items-center space-x-2 sm:space-x-4 mt-1">
                    <div className="text-center">
                      <p className="text-sm sm:text-2xl font-bold text-green-600">{vitaminOnTrack}</p>
                      <p className="text-xs text-gray-500">Vitamins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm sm:text-2xl font-bold text-green-600">{mineralOnTrack}</p>
                      <p className="text-xs text-gray-500">Minerals</p>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="text-green-600" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Moderate</p>
                  <div className="flex items-center space-x-2 sm:space-x-4 mt-1">
                    <div className="text-center">
                      <p className="text-sm sm:text-2xl font-bold text-yellow-600">{vitaminModerate}</p>
                      <p className="text-xs text-gray-500">Vitamins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm sm:text-2xl font-bold text-yellow-600">{mineralModerate}</p>
                      <p className="text-xs text-gray-500">Minerals</p>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TriangleAlert className="text-yellow-600" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Deficient</p>
                  <div className="flex items-center space-x-2 sm:space-x-4 mt-1">
                    <div className="text-center">
                      <p className="text-sm sm:text-2xl font-bold text-red-600">{vitaminDeficient}</p>
                      <p className="text-xs text-gray-500">Vitamins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm sm:text-2xl font-bold text-red-600">{mineralDeficient}</p>
                      <p className="text-xs text-gray-500">Minerals</p>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <CircleAlert className="text-red-600" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Vitamin Status Cards */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Vitamin Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(vitaminLevels).length > 0 
                    ? Object.entries(vitaminLevels).slice(0, showAllVitamins ? undefined : 4).map(([key, levels]: [string, any]) => (
                        <VitaminStatusCard
                          key={key}
                          vitaminKey={key}
                          intake={levels.intake}
                          rda={levels.rda}
                          percentage={levels.percentage}
                          status={levels.status}
                          foodSources={levels.foodSources}
                        />
                      ))
                    : // Show default vitamin progress bars when no data - show first 4, expand for all 13
                      ['vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k', 'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5', 'vitamin_b6', 'vitamin_b7', 'vitamin_b9', 'vitamin_b12']
                        .slice(0, showAllVitamins ? undefined : 4).map((vitaminKey) => (
                        <div key={vitaminKey} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {vitaminKey.replace('vitamin_', '').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-700">
                                  Vitamin {vitaminKey.replace('vitamin_', '').toUpperCase()}
                                </h3>
                                <p className="text-xs text-gray-500">0% of RDA</p>
                              </div>
                            </div>
                            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            </div>
                          </div>
                          <Progress value={0} className="h-2 bg-gray-200" />
                          <div className="text-center text-xs text-gray-500 mt-2">
                            Add foods to track this vitamin
                          </div>
                        </div>
                      ))
                  }
                </div>
                
                {(Object.keys(vitaminLevels).length > 4 || (Object.keys(vitaminLevels).length === 0)) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full mt-4 text-blue-600 hover:bg-blue-50 text-sm"
                    onClick={() => setShowAllVitamins(!showAllVitamins)}
                  >
                    {showAllVitamins ? 'Show Less' : 'View All Vitamins'} →
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Mineral Status Cards */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow mt-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Mineral Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(mineralLevels).length > 0 
                    ? Object.entries(mineralLevels).slice(0, showAllMinerals ? undefined : 4).map(([key, levels]: [string, any]) => (
                        <MineralStatusCard
                          key={key}
                          mineralKey={key}
                          intake={levels.intake}
                          rda={levels.rda}
                          percentage={levels.percentage}
                          status={levels.status}
                          foodSources={levels.foodSources}
                        />
                      ))
                    : // Show default mineral progress bars when no data - show first 4, expand for all 9  
                      ['calcium', 'iron', 'magnesium', 'zinc', 'selenium', 'phosphorus', 'potassium', 'sodium', 'manganese']
                        .slice(0, showAllMinerals ? undefined : 4).map((mineralKey) => (
                        <div key={mineralKey} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {mineralKey.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-700 capitalize">
                                  {mineralKey}
                                </h3>
                                <p className="text-xs text-gray-500">0% of RDA</p>
                              </div>
                            </div>
                            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            </div>
                          </div>
                          <Progress value={0} className="h-2 bg-gray-200" />
                          <div className="text-center text-xs text-gray-500 mt-2">
                            Add foods to track this mineral
                          </div>
                        </div>
                      ))
                  }
                </div>
                
                {(Object.keys(mineralLevels).length > 4 || (Object.keys(mineralLevels).length === 0)) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full mt-3 text-blue-600 hover:bg-blue-50 text-sm"
                    onClick={() => setShowAllMinerals(!showAllMinerals)}
                  >
                    {showAllMinerals ? 'Show Less' : 'View All Minerals'} →
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Macronutrient Status Card */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow mt-6">
              <CardContent className="p-0">
                <MacronutrientStatusCard userId={currentUser?.id || 1} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* NHS Food Suggestions for Today - Always Visible */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  NHS Food Suggestions for Today
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                {/* Priority Nutrients - Always Visible */}
                {foodSuggestions.gaps && foodSuggestions.gaps.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <h4 className="font-medium text-amber-800 mb-2 text-sm">Priority Nutrients</h4>
                    <div className="flex flex-wrap gap-1">
                      {foodSuggestions.gaps.slice(0, 4).map((gap: any, index: number) => (
                        <span 
                          key={index} 
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            gap.status === 'deficient' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {gap.nutrient.replace('_', ' ').replace('vitamin ', 'Vit ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top 2 Recommendations - Always Visible */}
                {foodSuggestions.recommendations && foodSuggestions.recommendations.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {foodSuggestions.recommendations.slice(0, 2).map((rec: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 via-white to-blue-50 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border-2 border-gray-100">
                          <span className="text-xl">
                            {rec.category === 'lunch' ? '🥗' : rec.category === 'dinner' ? '🍽️' : '🥜'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{rec.food}</h4>
                          <p className="text-xs text-gray-500 mb-1">{rec.portion}</p>
                          <p className="text-sm text-gray-600 mb-2">{rec.benefit}</p>
                          <p className="text-xs text-blue-600 italic">{rec.preparationTip}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                              {rec.category}
                            </span>
                            {rec.percentage && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                {rec.percentage}% daily value
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expandable Section */}
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="flex items-center justify-center w-full p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {expandedSections.recommendations ? (
                    <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>View All Suggestions <ChevronDown className="h-4 w-4 ml-1" /></>
                  )}
                </button>
              </CardContent>

              {expandedSections.recommendations && (
                <CardContent>
                  {foodSuggestions ? (
                    <div className="space-y-4">
                      {/* Additional Food Recommendations (excluding first 2) */}
                      {foodSuggestions.recommendations && foodSuggestions.recommendations.length > 2 ? (
                        <div className="space-y-3">
                          {foodSuggestions.recommendations.slice(2).map((rec: any, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 via-white to-blue-50 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border-2 border-gray-100">
                                <span className="text-2xl">
                                  {rec.category === 'lunch' ? '🥗' : rec.category === 'dinner' ? '🍽️' : '🥜'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{rec.food}</h4>
                                <p className="text-xs text-gray-500 mb-1">{rec.portion}</p>
                                <p className="text-sm text-gray-600 mb-2">{rec.benefit}</p>
                                <p className="text-xs text-blue-600 italic">{rec.preparationTip}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                    {rec.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 via-white to-blue-50 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border-2 border-gray-100">
                                <span className="text-2xl">🥗</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{rec.food}</h4>
                                <p className="text-sm text-gray-600 mb-2">{rec.benefit}</p>
                                <div className="flex flex-wrap gap-1">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                    NHS Guidance
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Meal Plan Preview */}
                      {foodSuggestions.mealPlan && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <div className="text-xs font-medium text-blue-800 mb-1">Lunch</div>
                            <div className="text-xs text-blue-600">
                              {foodSuggestions.mealPlan.lunch?.length || 0} suggestions
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <div className="text-xs font-medium text-green-800 mb-1">Dinner</div>
                            <div className="text-xs text-green-600">
                              {foodSuggestions.mealPlan.dinner?.length || 0} suggestions
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 text-center">
                            <div className="text-xs font-medium text-purple-800 mb-1">Snacks</div>
                            <div className="text-xs text-purple-600">
                              {foodSuggestions.mealPlan.snacks?.length || 0} suggestions
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 via-white to-blue-50 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border-2 border-gray-100">
                            <span className="text-2xl">🥗</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{rec.food}</h4>
                            <p className="text-sm text-gray-600 mb-2">{rec.benefit}</p>
                            <div className="flex flex-wrap gap-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                NHS Guidance
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {recommendations.length === 0 && (
                        <div className="text-center py-6 text-green-600">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="text-green-600" size={24} />
                          </div>
                          <p className="font-medium">Great job! No specific recommendations at the moment.</p>
                          <p className="text-sm">Your vitamin levels are looking good!</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Nutrition Standards Badge */}
            <NutritionSourceBadge />

            {/* Priority Nutrients - Always Visible */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Priority Nutrients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goalProgress.map((goalItem) => {
                    const Icon = goalItem.icon;
                    const colorClass = goalItem.category === 'immunity' ? 'purple' :
                                      goalItem.category === 'beauty' ? 'pink' :
                                      goalItem.category === 'energy' ? 'orange' : 'blue';
                    
                    return (
                      <div key={goalItem.goal} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 bg-${colorClass}-100 rounded-full flex items-center justify-center`}>
                              <Icon className={`text-${colorClass}-600`} size={16} />
                            </div>
                            <span className="font-medium text-gray-900">{goalItem.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{goalItem.progress}%</span>
                        </div>
                        <Progress value={goalItem.progress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Global Nutrition Standards - Collapsible */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow mb-8">
          <CardHeader className="pb-2">
            <button
              onClick={() => toggleSection('nutritionStandards')}
              className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <CardTitle className="text-lg font-semibold text-gray-900">
                Global Nutrition Standards
              </CardTitle>
              {expandedSections.nutritionStandards ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </CardHeader>
          {expandedSections.nutritionStandards && (
            <CardContent>
              <NutritionInsights 
                vitaminStatus={vitaminStatus?.vitaminLevels || {}}
                mineralStatus={mineralStatus?.mineralLevels || {}}
                userId={userId}
              />
            </CardContent>
          )}
        </Card>

        {/* Symptom Analysis - Collapsible */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow mb-8">
          <CardHeader className="pb-2">
            <button
              onClick={() => toggleSection('symptomAnalysis')}
              className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <CardTitle className="text-lg font-semibold text-gray-900">
                Symptom Analysis
              </CardTitle>
              {expandedSections.symptomAnalysis ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </CardHeader>
          {expandedSections.symptomAnalysis && (
            <CardContent>
              <SymptomAnalysis 
                vitaminStatus={vitaminStatus?.vitaminLevels || {}}
                mineralStatus={mineralStatus?.mineralLevels || {}}
              />
            </CardContent>
          )}
        </Card>

        {/* Nutrient Interactions - Collapsible */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow mb-8">
          <CardHeader className="pb-2">
            <button
              onClick={() => toggleSection('nutrientInteractions')}
              className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <CardTitle className="text-lg font-semibold text-gray-900">
                Nutrient Interactions
              </CardTitle>
              {expandedSections.nutrientInteractions ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </CardHeader>
          {expandedSections.nutrientInteractions && (
            <CardContent>
              <NutrientInteractions 
                vitaminStatus={vitaminStatus?.vitaminLevels || {}}
                mineralStatus={mineralStatus?.mineralLevels || {}}
              />
            </CardContent>
          )}
        </Card>

        {/* Floating Action Button for Add Food */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={() => setIsAddFoodOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-coral-600 to-coral-700 hover:from-coral-700 hover:to-coral-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>

        {/* Save & Export Dashboard Section - Moved to Bottom */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Save className="w-5 h-5" />
              Save & Export Dashboard
            </CardTitle>
            <p className="text-orange-600">Preserve your nutrition data and track your progress over time</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={saveDashboardSnapshot}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Snapshot
              </Button>
              
              <Button 
                onClick={() => setShowSnapshots(!showSnapshots)}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <History className="w-4 h-4 mr-2" />
                {showSnapshots ? 'Hide' : 'View'} Saved Snapshots
              </Button>
              
              <Button 
                onClick={exportDashboardPDF}
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Report (PDF)
              </Button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-blue-800 mb-2">📅 Daily Data Management</h4>
              <p className="text-sm text-blue-700 mb-2">
                Your food logs automatically refresh each day to give you a clean start. Data from previous days is automatically cleaned up after 7 days.
              </p>
              <p className="text-sm text-blue-600">
                💡 <strong>Want to keep today's progress?</strong> Save a snapshot before tomorrow to preserve your nutritional data, track changes over time, or share with healthcare providers.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saved Snapshots Section */}
        {showSnapshots && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <History className="w-5 h-5" />
                Your Saved Dashboard Snapshots
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!savedSnapshots || !Array.isArray(savedSnapshots) || savedSnapshots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Save className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No snapshots saved yet.</p>
                  <p className="text-sm">Save your first snapshot to start tracking your progress over time!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedSnapshots && savedSnapshots.map((snapshot: any) => (
                    <div key={snapshot.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Dashboard Snapshot - {snapshot.date}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Saved on {new Date(snapshot.timestamp).toLocaleDateString()} at {new Date(snapshot.timestamp).toLocaleTimeString()}
                          </p>
                          <div className="text-sm text-gray-500">
                            <span className="inline-block mr-4">
                              📊 {snapshot.snapshotData?.summary?.totalNutrients || 0} nutrients tracked
                            </span>
                            <span className="inline-block mr-4">
                              ✅ {snapshot.snapshotData?.summary?.totalOnTrack || 0} on track
                            </span>
                            <span className="inline-block">
                              📈 {snapshot.snapshotData?.summary?.dailyProgress || 0}% daily progress
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewSnapshotDetails(snapshot)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteSnapshot(snapshot.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Food Search Modal */}
        <FoodSearchModal 
          isOpen={isAddFoodOpen}
          onClose={() => setIsAddFoodOpen(false)}
          userId={userId}
          mealType={selectedMealType}
        />

        {/* Snapshot Details Modal */}
        <Dialog open={!!selectedSnapshot} onOpenChange={() => setSelectedSnapshot(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="snapshot-description">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-700">
                <Calendar className="w-5 h-5" />
                Dashboard Snapshot Details
              </DialogTitle>
            </DialogHeader>
            <div id="snapshot-description" className="sr-only">
              View detailed information about your saved dashboard snapshot including food entries, vitamin and mineral status.
            </div>
            
            {selectedSnapshot && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Date Saved</p>
                    <p className="font-medium">{new Date(selectedSnapshot.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Time Saved</p>
                    <p className="font-medium">{new Date(selectedSnapshot.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>

                {selectedSnapshot.snapshotData && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-700 mb-2">Snapshot Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Daily Progress</p>
                          <p className="font-medium">{selectedSnapshot.snapshotData.summary?.dailyProgress || 0}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Food Entries</p>
                          <p className="font-medium">{selectedSnapshot.snapshotData.summary?.totalFoodEntries || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Vitamins Status</p>
                          <p className="font-medium">{selectedSnapshot.snapshotData.summary?.sufficientVitamins || 0}/{selectedSnapshot.snapshotData.summary?.totalVitamins || 0} Sufficient</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Minerals Status</p>
                          <p className="font-medium">{selectedSnapshot.snapshotData.summary?.sufficientMinerals || 0}/{selectedSnapshot.snapshotData.summary?.totalMinerals || 0} Sufficient</p>
                        </div>
                      </div>
                    </div>

                    {selectedSnapshot.snapshotData.foodLogs && selectedSnapshot.snapshotData.foodLogs.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Food Entries</h4>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                          {selectedSnapshot.snapshotData.foodLogs.map((log: any, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                              <div>
                                <p className="font-medium text-sm">{log.foodName}</p>
                                <p className="text-xs text-gray-500">{log.mealType}</p>
                              </div>
                              <div className="text-sm text-gray-600">
                                {log.quantity} {log.unit}
                                {log.calories && <span className="ml-2 text-orange-600">({log.calories} cal)</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vitamin Status Summary */}
                    {selectedSnapshot.snapshotData.vitaminStatus?.vitaminLevels && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Vitamins Overview</h4>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {Object.entries(selectedSnapshot.snapshotData.vitaminStatus.vitaminLevels).slice(0, 6).map(([vitamin, data]: [string, any]) => (
                              <div key={vitamin} className="text-center">
                                <p className="font-medium text-blue-800">{vitamin.replace('_', ' ').toUpperCase()}</p>
                                <p className={`text-xs ${data.status === 'sufficient' ? 'text-green-600' : data.status === 'moderate' ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {Math.round(data.percentage)}%
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mineral Status Summary */}
                    {selectedSnapshot.snapshotData.mineralStatus?.mineralLevels && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Minerals Overview</h4>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {Object.entries(selectedSnapshot.snapshotData.mineralStatus.mineralLevels).slice(0, 6).map(([mineral, data]: [string, any]) => (
                              <div key={mineral} className="text-center">
                                <p className="font-medium text-green-800">{mineral.replace('_', ' ').toUpperCase()}</p>
                                <p className={`text-xs ${data.status === 'sufficient' ? 'text-green-600' : data.status === 'moderate' ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {Math.round(data.percentage)}%
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}