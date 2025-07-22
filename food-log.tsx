import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Calendar, Search, ChevronDown, Target, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FoodSearchModal } from "@/components/food-search-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ACHIEVEMENT_DEFINITIONS } from "@shared/achievement-system";
import { findPortionSize, calculateGramsFromQuantity } from "../../../shared/food-portions";
import { 
  calculateCaloriesFromFoodLogs, 
  getCalorieRecommendations, 
  getCalorieIntakeStatus,
  type UserCalorieProfile 
} from '@shared/calorie-calculator';
import { getCorrectedCalories } from '@shared/food-calorie-corrections';

const MEAL_TYPES = [
  { id: "breakfast", name: "Breakfast", icon: "🌅", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  { id: "lunch", name: "Lunch", icon: "☀️", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { id: "dinner", name: "Dinner", icon: "🌙", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  { id: "snack", name: "Snacks", icon: "🍎", bgColor: "bg-green-50", borderColor: "border-green-200" },
];

export default function FoodLog() {
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [isScanFoodOpen, setIsScanFoodOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user data from localStorage
  const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    const currentUser = localStorage.getItem("nutritrack_current_user");
    return currentUser ? JSON.parse(currentUser) : user ? JSON.parse(user) : null;
  };

  const currentUser = getCurrentUser();

  const { data: foodLogs = [], isLoading } = useQuery({
    queryKey: ["/api/food-logs", currentUser?.id, selectedDate],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      // Always use localStorage for food logs since API has auth issues
      const foodLogsKey = `food_logs_${currentUser.id}_${selectedDate}`;
      const localData = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
      console.log("FoodLog page localStorage food logs fetched:", localData);
      return localData;
    },
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 60000, // Refetch every 60 seconds (1 minute)
  });

  // Get vitamin status for accurate tracking
  const { data: vitaminStatus } = useQuery({
    queryKey: ["/api/vitamin-status", currentUser?.id, selectedDate],
    enabled: !!currentUser?.id,
  });

  const deleteFoodMutation = useMutation({
    mutationFn: async (logId: number) => {
      console.log("Attempting to delete food log:", logId);
      
      try {
        const response = await apiRequest("DELETE", `/api/food-logs/${logId}`);
        console.log("API delete successful");
        return response;
      } catch (error) {
        console.log("API delete failed, using localStorage fallback");
        
        // If API fails, handle deletion locally via localStorage
        const currentUser = JSON.parse(localStorage.getItem("nutritrack_current_user") || "{}");
        if (currentUser.id) {
          const foodLogsKey = `food_logs_${currentUser.id}_${selectedDate}`;
          const existingLogs = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          console.log("Current logs before deletion:", existingLogs);
          
          const updatedLogs = existingLogs.filter((log: any) => log.id !== logId);
          console.log("Updated logs after deletion:", updatedLogs);
          
          localStorage.setItem(foodLogsKey, JSON.stringify(updatedLogs));
          return { ok: true, localDelete: true };
        }
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log("Delete mutation success:", result);
      
      // Force invalidate all related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vitamin-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mineral-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/macro-status"] });
      
      // Force refetch the current data
      queryClient.refetchQueries({ queryKey: ["/api/food-logs", currentUser?.id, selectedDate] });
      
      toast({
        title: "Food removed",
        description: "The food has been removed from your log.",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error removing food",
        description: "Please try again. If this persists, try refreshing the page.",
        variant: "destructive",
      });
    },
  });

  const groupedLogs = MEAL_TYPES.map(mealType => ({
    ...mealType,
    foods: foodLogs.filter((log: any) => log.mealType === mealType.id)
  }));

  // Use the localStorage currentUser for calorie calculations

  // Calculate accurate calories using corrected nutritional data (same as dashboard)
  const totalCalories = foodLogs.reduce((total: number, log: any) => {
    const portionSize = parseFloat(log.portionSize);
    const foodName = log.food?.name || '';
    const originalCalories = log.food?.nutrients?.calories || log.food?.nutrients?.energy_kcal;
    
    // Use the same calorie correction system as the dashboard
    const { calories } = getCorrectedCalories(foodName, portionSize, originalCalories);
    
    return total + calories;
  }, 0);

  // Create user profile for calorie recommendations
  const userProfile: UserCalorieProfile = {
    age: currentUser?.age || 25,
    gender: (currentUser?.gender as 'male' | 'female') || 'female',
    height: currentUser?.height || 170,
    weight: currentUser?.weight || 70,
    activityLevel: (currentUser?.activityLevel as any) || 'moderately_active'
  };

  // Get personalized calorie recommendations
  const calorieRecommendations = getCalorieRecommendations(userProfile);
  const calorieStatus = getCalorieIntakeStatus(totalCalories, calorieRecommendations, 'maintenance');

  // Calculate vitamin tracking stats from actual data
  const vitaminLevels = vitaminStatus?.vitaminLevels || {};
  const totalVitamins = Object.keys(vitaminLevels).length;
  const vitaminsWithIntake = Object.values(vitaminLevels).filter((v: any) => v.intake > 0).length;
  const overallProgress = totalVitamins > 0 ? 
    Math.round(Object.values(vitaminLevels).reduce((sum: number, v: any) => sum + v.percentage, 0) / totalVitamins) : 0;

  const handleAddFood = (mealType: string) => {
    setSelectedMealType(mealType);
    setIsAddFoodOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Date and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Log</h1>
          <p className="text-gray-600">Track your daily nutrition intake</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <Card className="p-4 min-w-[200px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target size={16} className="text-blue-600" />
                  <p className="text-sm font-medium text-gray-700">Calories</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {totalCalories} / {calorieStatus.target}
                  </p>
                  <p className={`text-xs font-medium ${
                    calorieStatus.status === 'optimal' ? 'text-green-600' :
                    calorieStatus.status === 'under' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {calorieStatus.percentage}% of target
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    calorieStatus.status === 'optimal' ? 'bg-green-500' :
                    calorieStatus.status === 'under' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(calorieStatus.percentage, 100)}%` }}
                />
              </div>
              
              {calorieStatus.difference !== 0 && (
                <p className="text-xs text-gray-600">
                  {calorieStatus.difference > 0 ? '+' : ''}{calorieStatus.difference} kcal from target
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="grid gap-6">
        {groupedLogs.map((meal) => (
          <Card key={meal.id} className={`${meal.bgColor} ${meal.borderColor} border-2`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-gray-100">
                  {meal.icon}
                </div>
                <div>
                  <span className="text-lg font-semibold">{meal.name}</span>
                  <p className="text-sm text-gray-500 font-normal">
                    {meal.foods.length} {meal.foods.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 shadow-sm"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Food
                    <ChevronDown size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => handleAddFood(meal.id)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Search size={16} className="text-blue-600" />
                    <div>
                      <span className="font-medium">Search Food</span>
                      <p className="text-xs text-gray-500">Browse database</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            
            <CardContent>
              {meal.foods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No foods logged for {meal.name.toLowerCase()}</p>
                  <div className="flex justify-center mt-3">
                    <Button
                      variant="ghost"
                      onClick={() => handleAddFood(meal.id, 'manual')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Search size={16} className="mr-1" />
                      Add Food
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {meal.foods.map((log: any) => {
                    // Function to get appropriate food emoji based on food name
                    const getFoodEmoji = (foodName: string) => {
                      const name = foodName.toLowerCase();
                      
                      // Fruits
                      if (name.includes('apple')) return '🍎';
                      if (name.includes('banana')) return '🍌';
                      if (name.includes('orange') || name.includes('citrus')) return '🍊';
                      if (name.includes('grape')) return '🍇';
                      if (name.includes('strawberry')) return '🍓';
                      if (name.includes('blueberry')) return '🫐';
                      if (name.includes('cherry')) return '🍒';
                      if (name.includes('peach')) return '🍑';
                      if (name.includes('pineapple')) return '🍍';
                      if (name.includes('watermelon')) return '🍉';
                      if (name.includes('lemon')) return '🍋';
                      if (name.includes('avocado')) return '🥑';
                      
                      // Vegetables
                      if (name.includes('tomato')) return '🍅';
                      if (name.includes('carrot')) return '🥕';
                      if (name.includes('broccoli')) return '🥦';
                      if (name.includes('spinach') || name.includes('lettuce') || name.includes('kale')) return '🥬';
                      if (name.includes('pepper') || name.includes('bell')) return '🫑';
                      if (name.includes('corn')) return '🌽';
                      if (name.includes('potato')) return '🥔';
                      if (name.includes('onion')) return '🧅';
                      if (name.includes('garlic')) return '🧄';
                      if (name.includes('cucumber')) return '🥒';
                      if (name.includes('eggplant')) return '🍆';
                      
                      // Proteins
                      if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) return '🐟';
                      if (name.includes('chicken') || name.includes('poultry')) return '🍗';
                      if (name.includes('beef') || name.includes('steak')) return '🥩';
                      if (name.includes('egg')) return '🥚';
                      
                      // Grains & Bread
                      if (name.includes('bread') || name.includes('toast')) return '🍞';
                      if (name.includes('rice')) return '🍚';
                      if (name.includes('pasta') || name.includes('noodle')) return '🍝';
                      if (name.includes('cereal') || name.includes('oats')) return '🥣';
                      
                      // Dairy
                      if (name.includes('milk')) return '🥛';
                      if (name.includes('cheese')) return '🧀';
                      if (name.includes('yogurt')) return '🥛';
                      
                      // Nuts & Seeds
                      if (name.includes('almond') || name.includes('nuts')) return '🥜';
                      
                      // Default healthy food
                      return '🥗';
                    };

                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border border-gray-100">
                            <span className="text-2xl">{getFoodEmoji(log.food?.name || "")}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.food?.name || "Unknown Food"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(() => {
                                const quantity = parseFloat(log.portionSize);
                                const portion = findPortionSize(log.food?.name || "");
                                
                                if (portion) {
                                  // Display the actual quantity and unit
                                  if (quantity === 1) {
                                    return `1 ${portion.unit}`;
                                  } else {
                                    return `${quantity} ${portion.unit}s`;
                                  }
                                } else {
                                  // For foods without specific portions, show as servings
                                  if (quantity === 1) {
                                    return `1 serving`;
                                  } else {
                                    return `${quantity} servings`;
                                  }
                                }
                              })()} • 
                              {(() => {
                                const quantity = parseFloat(log.portionSize);
                                const foodName = log.food?.name || '';
                                const originalCalories = log.food?.nutrients?.calories || log.food?.nutrients?.energy_kcal || 100;
                                
                                // Calculate calories based on quantity of servings
                                const calories = Math.round(quantity * originalCalories);
                                
                                return `${calories} kcal`;
                              })()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              +vitamins
                            </p>
                            <p className="text-xs text-gray-400">
                              Added recently
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFoodMutation.mutate(log.id)}
                            disabled={deleteFoodMutation.isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete this food entry"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-blue-600" />
            <span>Daily Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{foodLogs.length}</p>
              <p className="text-sm text-gray-600">Items Logged</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{totalCalories}</p>
              <p className="text-sm text-gray-600">kcal Consumed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{vitaminsWithIntake}</p>
              <p className="text-sm text-gray-600">Vitamins Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{overallProgress}%</p>
              <p className="text-sm text-gray-600">Nutrition Goal</p>
            </div>
          </div>

          {/* Calorie Breakdown */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Calorie Analysis</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calorie Progress */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Daily Target</span>
                  <span className="text-sm text-gray-600">{calorieStatus.target} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Consumed</span>
                  <span className="text-sm text-gray-600">{totalCalories} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Remaining</span>
                  <span className={`text-sm font-medium ${
                    calorieStatus.difference < 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {Math.abs(calorieStatus.difference)} kcal {calorieStatus.difference < 0 ? 'needed' : 'over'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      calorieStatus.status === 'optimal' ? 'bg-green-500' :
                      calorieStatus.status === 'under' ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(calorieStatus.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Metabolic Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Your Metabolic Profile</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Metabolic Rate</span>
                    <span className="font-medium">{calorieRecommendations.basalMetabolicRate} kcal/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Energy Needs</span>
                    <span className="font-medium">{calorieRecommendations.totalDailyEnergyExpenditure} kcal/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">For Weight Loss</span>
                    <span className="font-medium text-orange-600">{calorieRecommendations.weightLoss} kcal/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">For Weight Gain</span>
                    <span className="font-medium text-green-600">{calorieRecommendations.weightGain} kcal/day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized Recommendation */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Recommendation:</strong> {calorieStatus.recommendation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Food Modals */}
      <FoodSearchModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        userId={currentUser?.id || 0}
        mealType={selectedMealType}
      />
      

    </div>
  );
}
