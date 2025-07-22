import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Zap, Wheat, Droplets } from "lucide-react";
import { NutrientTooltip } from "@/components/nutrient-tooltip";

interface MacronutrientStatusCardProps {
  userId: number;
}

interface MacroCardProps {
  name: string;
  icon: React.ReactNode;
  intake: number;
  target: number;
  unit: string;
  percentage: number;
  status: 'low' | 'good' | 'high';
  foodSources: { food: string; amount: number; percentage: number }[];
}

function MacroCard({ name, icon, intake, target, unit, percentage, status, foodSources }: MacroCardProps) {
  const [showAllSources, setShowAllSources] = useState(false);

  const getMacroFunction = (macroName: string): string => {
    const functions: Record<string, string> = {
      'Energy': 'Energy (Calories) - Provides fuel for all body functions, physical activity, and metabolism. Essential for maintaining body weight, supporting growth, and powering cellular processes.',
      'Protein': 'Protein - Essential for building and repairing tissues, making enzymes and hormones. Critical for muscle growth, immune function, wound healing, and maintaining lean body mass.',
      'Carbs': 'Carbohydrates - Primary energy source for the brain and muscles. Provides quick energy, supports brain function, physical performance, and helps maintain blood glucose levels.',
      'Fat': 'Fat - Essential for hormone production, vitamin absorption, and cell membrane structure. Provides long-lasting energy, supports brain health, and aids absorption of fat-soluble vitamins.',
      'Fiber': 'Fiber - Promotes digestive health, helps control blood sugar and cholesterol levels. Supports gut microbiome, aids in weight management, and reduces risk of chronic diseases.'
    };
    return functions[macroName] || 'Important macronutrient for overall health and energy.';
  };

  const getStatusColor = (status: 'low' | 'good' | 'high') => {
    switch (status) {
      case 'low': return 'bg-orange-500';
      case 'good': return 'bg-green-500';
      case 'high': return 'bg-red-500';
    }
  };

  const getStatusBadgeVariant = (status: 'low' | 'good' | 'high') => {
    switch (status) {
      case 'low': return 'secondary' as const;
      case 'good': return 'default' as const;
      case 'high': return 'destructive' as const;
    }
  };

  return (
    <NutrientTooltip 
      title={name} 
      content={getMacroFunction(name)}
    >
      <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {intake} / {target} {unit}
          </span>
          <Badge variant={getStatusBadgeVariant(status)}>
            {percentage}%
          </Badge>
        </div>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className="h-2"
        style={{
          '--progress-background': getStatusColor(status)
        } as React.CSSProperties}
      />
      
      {foodSources && foodSources.length > 0 && (
        <div className="space-y-1 mt-2">
          <p className="text-xs font-medium text-gray-600">Sources:</p>
          {(showAllSources ? foodSources : foodSources.slice(0, 3)).map((source, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-xs text-gray-600 truncate max-w-[160px]">
                {source.food}
              </span>
              <span className="text-xs font-medium text-gray-700">
                {source.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
          {foodSources.length > 3 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllSources(!showAllSources);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
            >
              {showAllSources ? 'Show less' : `+${foodSources.length - 3} more`}
            </button>
          )}
        </div>
      )}
      </div>
    </NutrientTooltip>
  );
}

export function MacronutrientStatusCard({ userId }: MacronutrientStatusCardProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: macroStatus, isLoading, error } = useQuery({
    queryKey: ["/api/macro-status", userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/macro-status/${userId}?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Macronutrient API response:', data);
          return data;
        } else {
          throw new Error('API failed');
        }
      } catch (error) {
        console.log("Macro status API failed, calculating from localStorage...");
        return calculateMacroFromLocalStorage();
      }
    },
    staleTime: 0,
    refetchInterval: 60000, // Refetch every 60 seconds (1 minute)
  });

  const calculateMacroFromLocalStorage = () => {
    try {
      const user = localStorage.getItem("user");
      const currentUser = localStorage.getItem("nutritrack_current_user");
      const actualUser = currentUser ? JSON.parse(currentUser) : user ? JSON.parse(user) : {};
      
      // Try different user ID sources
      let actualUserId = actualUser.id || userId;
      
      console.log('Macro localStorage debug:');
      console.log('User from localStorage:', actualUser);
      console.log('Using userId:', actualUserId);
      
      if (!actualUserId) {
        console.log('No user ID found');
        return null;
      }
      
      // Use the same key format as dashboard: food_logs_${userId}_${date}
      const foodLogsKey = `food_logs_${actualUserId}_${today}`;
      const storedLogs = localStorage.getItem(foodLogsKey);
      
      console.log('Looking for localStorage key:', foodLogsKey);
      console.log('StoredLogs exists:', !!storedLogs);
      
      if (!storedLogs) {
        console.log('No food logs found in localStorage');
        return null;
      }
      
      const localFoodLogs = JSON.parse(storedLogs);
      
      console.log('Macronutrient localStorage calculation:');
      console.log('Current user:', currentUser);
      console.log('Actual user ID:', actualUserId);
      console.log('Food logs for today:', localFoodLogs);
      
      if (Array.isArray(localFoodLogs) && localFoodLogs.length > 0) {
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

        localFoodLogs.forEach((log: any) => {
          if (log.food && log.food.nutrients) {
            const nutrients = log.food.nutrients;
            const portionMultiplier = parseFloat(log.portionSize || '1');
            
            console.log(`Processing food: ${log.food.name}, portion: ${log.portionSize}`);
            console.log(`Nutrients:`, nutrients);
            
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

        const macroPercentages = {
          energy: Math.round((macroIntake.energy / macroTargets.energy) * 100),
          protein: Math.round((macroIntake.protein / macroTargets.protein) * 100),
          carbs: Math.round((macroIntake.carbs / macroTargets.carbs) * 100),
          fat: Math.round((macroIntake.fat / macroTargets.fat) * 100),
          fiber: Math.round((macroIntake.fiber / macroTargets.fiber) * 100)
        };

        console.log('Calculated macronutrient intake:', macroIntake);
        console.log('Calculated macronutrient percentages:', macroPercentages);

        return {
          intake: macroIntake,
          targets: macroTargets,
          percentages: macroPercentages
        };
      } else {
        console.log('No food logs found or empty array');
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error calculating macros from localStorage:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Macronutrient Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !macroStatus) {
    // Show default macronutrient progress bars when no data
    const defaultMacros = [
      { name: 'Energy', icon: <Zap className="h-4 w-4" />, unit: 'kcal', target: 2000 },
      { name: 'Protein', icon: <Activity className="h-4 w-4" />, unit: 'g', target: 50 },
      { name: 'Carbs', icon: <Wheat className="h-4 w-4" />, unit: 'g', target: 300 },
      { name: 'Fat', icon: <Droplets className="h-4 w-4" />, unit: 'g', target: 65 }
    ];

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Macronutrient Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {defaultMacros.map((macro, index) => (
              <MacroCard
                key={macro.name}
                name={macro.name}
                icon={macro.icon}
                intake={0}
                target={macro.target}
                unit={macro.unit}
                percentage={0}
                status="low"
                foodSources={[]}
              />
            ))}
            <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
              Add foods to track your macronutrients
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }



  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Daily Macronutrients
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Energy, protein, carbs, and fat intake from authentic food data
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Energy (Calories) */}
        <MacroCard 
          name="Energy"
          icon={<Zap className="h-4 w-4 text-yellow-600" />}
          intake={Math.round(macroStatus?.intake?.energy || 0)}
          target={Math.round(macroStatus?.targets?.energy || 2000)}
          unit="kcal"
          percentage={Math.round(macroStatus?.percentages?.energy || 0)}
          status={macroStatus?.percentages?.energy >= 100 ? 'high' : macroStatus?.percentages?.energy >= 70 ? 'good' : 'low'}
          foodSources={macroStatus?.foodSources?.energy || []}
        />

        <Separator />

        {/* Macronutrients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Protein */}
          <MacroCard 
            name="Protein"
            icon={<Activity className="h-4 w-4 text-blue-600" />}
            intake={Math.round(macroStatus?.intake?.protein || 0)}
            target={Math.round(macroStatus?.targets?.protein || 50)}
            unit="g"
            percentage={Math.round(macroStatus?.percentages?.protein || 0)}
            status={macroStatus?.percentages?.protein >= 100 ? 'good' : macroStatus?.percentages?.protein >= 70 ? 'good' : 'low'}
            foodSources={macroStatus?.foodSources?.protein || []}
          />

          {/* Carbohydrates */}
          <MacroCard 
            name="Carbs"
            icon={<Wheat className="h-4 w-4 text-amber-600" />}
            intake={Math.round(macroStatus?.intake?.carbs || 0)}
            target={Math.round(macroStatus?.targets?.carbs || 250)}
            unit="g"
            percentage={Math.round(macroStatus?.percentages?.carbs || 0)}
            status={macroStatus?.percentages?.carbs >= 100 ? 'good' : macroStatus?.percentages?.carbs >= 70 ? 'good' : 'low'}
            foodSources={macroStatus?.foodSources?.carbs || []}
          />

          {/* Fat */}
          <MacroCard 
            name="Fat"
            icon={<Droplets className="h-4 w-4 text-purple-600" />}
            intake={Math.round(macroStatus?.intake?.fat || 0)}
            target={Math.round(macroStatus?.targets?.fat || 65)}
            unit="g"
            percentage={Math.round(macroStatus?.percentages?.fat || 0)}
            status={macroStatus?.percentages?.fat >= 100 ? 'good' : macroStatus?.percentages?.fat >= 70 ? 'good' : 'low'}
            foodSources={macroStatus?.foodSources?.fat || []}
          />
        </div>

        <Separator />

        {/* Additional Nutrients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fiber */}
          <MacroCard 
            name="Fiber"
            icon={<span className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">F</span>}
            intake={Math.round(macroStatus?.intake?.fiber || 0)}
            target={Math.round(macroStatus?.targets?.fiber || 25)}
            unit="g"
            percentage={Math.round(macroStatus?.percentages?.fiber || 0)}
            status={macroStatus?.percentages?.fiber >= 100 ? 'good' : macroStatus?.percentages?.fiber >= 70 ? 'good' : 'low'}
            foodSources={macroStatus?.foodSources?.fiber || []}
          />

          {/* Sugar */}
          <MacroCard 
            name="Sugar"
            icon={<span className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">S</span>}
            intake={Math.round(macroStatus?.intake?.sugar || 0)}
            target={Math.round(macroStatus?.targets?.sugar || 50)}
            unit="g limit"
            percentage={Math.round(macroStatus?.percentages?.sugar || 0)}
            status={macroStatus?.percentages?.sugar >= 100 ? 'high' : macroStatus?.percentages?.sugar >= 70 ? 'good' : 'good'}
            foodSources={macroStatus?.foodSources?.sugar || []}
          />
        </div>

        {/* Recommendations */}
        {macroStatus?.recommendations && macroStatus.recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {macroStatus.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Data Source */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Calculated from authentic USDA nutritional data • Updated: {new Date(macroStatus.date).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}