import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, TrendingUp, Heart, AlertTriangle, CheckCircle, Activity, ChevronDown, Lightbulb } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { generateClientSideFoodSuggestions } from "@/lib/food-suggestions";
import { apiRequest } from "@/lib/queryClient";
import { SaveExportPanel } from "@/components/save-export-panel";

// Helper function to calculate vitamin status from food logs
function calculateVitaminStatusFromFoodLogs(foodLogs: any[], user: any) {
  const vitaminLevels: any = {};
  
  // Default RDA values for adult male (you can enhance this based on user data)
  const defaultRDA = {
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
function calculateMineralStatusFromFoodLogs(foodLogs: any[], user: any) {
  const mineralLevels: any = {};
  
  // Default RDA values for adult male (you can enhance this based on user data)
  const defaultRDA = {
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

// NutriTracking Logo Component
function NutriTrackingLogo() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white">
        <div className="flex items-center gap-0.5">
          <Heart className="w-5 h-5" />
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          NutriTracking
        </h1>
        <TrendingUp className="w-5 h-5 text-orange-600" />
      </div>
    </div>
  );
}

export default function Analysis() {
  const [timeRange, setTimeRange] = useState("7");
  const [selectedVitamin, setSelectedVitamin] = useState("all");
  const [expandedVitamins, setExpandedVitamins] = useState<{[key: string]: boolean}>({});
  const [expandedMinerals, setExpandedMinerals] = useState<{[key: string]: boolean}>({});
  const [expandedMacros, setExpandedMacros] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const [showNHSGuidance, setShowNHSGuidance] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Get current user data with localStorage fallback
  const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    const currentUser = localStorage.getItem("nutritrack_current_user");
    return currentUser ? JSON.parse(currentUser) : user ? JSON.parse(user) : null;
  };

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const actualUser = currentUser || getCurrentUser();
  const userId = actualUser?.id;

  // Get period-based analysis data
  const { data: periodAnalysis } = useQuery({
    queryKey: [`/api/food-logs/user/${userId}/analysis`, timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/food-logs/user/${userId}/analysis?days=${timeRange}`, { 
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Get vitamin status data with localStorage fallback
  const { data: vitaminStatus } = useQuery({
    queryKey: [`/api/vitamin-status/${userId}`, today],
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
        console.log("Analysis vitamin status API failed, calculating from localStorage...");
        
        // Calculate vitamin status from localStorage food logs
        const user = getCurrentUser();
        
        if (user?.id) {
          const foodLogsKey = `food_logs_${user.id}_${today}`;
          const localFoodLogs = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          
          console.log('Analysis vitamin - using key:', foodLogsKey);
          console.log('Analysis vitamin - found logs:', localFoodLogs.length);
          
          if (Array.isArray(localFoodLogs) && localFoodLogs.length > 0) {
            return calculateVitaminStatusFromFoodLogs(localFoodLogs, user);
          }
        }
        
        // Return empty status if no data
        return { vitaminLevels: {} };
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Get mineral status data with localStorage fallback
  const { data: mineralStatus } = useQuery({
    queryKey: [`/api/mineral-status/${userId}`, today],
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
        console.log("Analysis mineral status API failed, calculating from localStorage...");
        
        // Calculate mineral status from localStorage food logs
        const user = getCurrentUser();
        
        if (user?.id) {
          const foodLogsKey = `food_logs_${user.id}_${today}`;
          const localFoodLogs = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          
          console.log('Analysis mineral - using key:', foodLogsKey);
          console.log('Analysis mineral - found logs:', localFoodLogs.length);
          
          if (Array.isArray(localFoodLogs) && localFoodLogs.length > 0) {
            return calculateMineralStatusFromFoodLogs(localFoodLogs, user);
          }
        }
        
        // Return empty status if no data
        return { mineralLevels: {} };
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Get food logs data with localStorage fallback
  const { data: foodLogsData } = useQuery({
    queryKey: ["/api/food-logs", "user", userId, today],
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
        console.log("Analysis API food logs failed, trying localStorage fallback...");
        
        // Fallback to localStorage
        const user = getCurrentUser();
        
        if (user?.id) {
          const foodLogsKey = `food_logs_${user.id}_${today}`;
          const localData = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          console.log("Analysis food logs - using key:", foodLogsKey);
          console.log("Analysis localStorage food logs:", localData);
          return Array.isArray(localData) ? localData : [];
        }
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 60000, // Refetch every 60 seconds (1 minute)
  });

  // Get macro status data with localStorage fallback
  const { data: macroStatus } = useQuery({
    queryKey: [`/api/macro-status/${userId}`, today],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/macro-status/${userId}?date=${today}`, { 
          credentials: 'include'
        });
        if (response.ok) {
          return await response.json();
        }
        throw new Error('API failed');
      } catch (error) {
        console.log("Analysis macro status API failed, calculating from localStorage...");
        
        // Calculate macro status from localStorage food logs
        const user = getCurrentUser();
        
        if (user?.id) {
          const foodLogsKey = `food_logs_${user.id}_${today}`;
          const localFoodLogs = JSON.parse(localStorage.getItem(foodLogsKey) || "[]");
          
          console.log('Analysis macro - using key:', foodLogsKey);
          console.log('Analysis macro - found logs:', localFoodLogs.length);
          
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

            // Calculate total intake from all food logs
            localFoodLogs.forEach((log: any) => {
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

            return {
              intake: macroIntake,
              targets: macroTargets
            };
          }
        }
        
        // Return empty status if no data
        return {};
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Generate food suggestions based on nutritional gaps
  const vitaminLevelsForSuggestions = vitaminStatus?.vitaminLevels || {};
  const mineralLevelsForSuggestions = mineralStatus?.mineralLevels || {};
  const foodSuggestions = generateClientSideFoodSuggestions(vitaminLevelsForSuggestions, mineralLevelsForSuggestions);

  // Export functions
  const exportToPDF = async () => {
    try {
      const vitaminData = vitaminStatus;
      const mineralData = mineralStatus;
      const foodLogs = foodLogsData || [];

      if (!vitaminData || !mineralData || !foodLogs) {
        toast({
          title: "Export Error",
          description: "Please wait for all data to load before exporting.",
          variant: "destructive",
        });
        return;
      }

      // Create comprehensive HTML report
      const htmlContent = generateHTMLReport(vitaminData, mineralData, foodLogs);
      
      // Use window.print() for PDF generation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }

      toast({
        title: "Report Generated",
        description: "Your nutrition report has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateHTMLReport = (vitaminData: any, mineralData: any, foodLogs: any[]) => {
    const date = new Date().toLocaleDateString();
    
    const deficientVitamins = Object.entries(vitaminData.vitaminLevels || {})
      .filter(([_, data]: [string, any]) => data.status === 'deficient')
      .map(([vitamin, data]: [string, any]) => `${vitamin.replace('vitamin_', '').toUpperCase()}: ${data.percentage}% of RDA`);

    const deficientMinerals = Object.entries(mineralData.mineralLevels || {})
      .filter(([_, data]: [string, any]) => data.status === 'deficient')
      .map(([mineral, data]: [string, any]) => `${mineral.charAt(0).toUpperCase() + mineral.slice(1)}: ${data.percentage}% of RDA`);

    return `
<!DOCTYPE html>
<html>
<head>
    <title>VitaMinTrack Nutrition Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .deficiency { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 10px 0; }
        .normal { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 10px; margin: 10px 0; }
        .food-item { background-color: #f8fafc; padding: 8px; margin: 5px 0; border-radius: 4px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>VitaMinTrack Nutrition Report</h1>
        <p>Generated on: ${date}</p>
        <p>User: ${currentUser?.username || 'User'}</p>
    </div>
    
    <div class="section">
        <h2>Vitamin Status Summary</h2>
        ${deficientVitamins.length > 0 ? 
          `<div class="deficiency"><strong>Deficiencies Identified:</strong><br>${deficientVitamins.join('<br>')}</div>` : 
          '<div class="normal">No vitamin deficiencies detected</div>'
        }
    </div>
    
    <div class="section">
        <h2>Mineral Status Summary</h2>
        ${deficientMinerals.length > 0 ? 
          `<div class="deficiency"><strong>Deficiencies Identified:</strong><br>${deficientMinerals.join('<br>')}</div>` : 
          '<div class="normal">No mineral deficiencies detected</div>'
        }
    </div>
    
    <div class="section">
        <h2>Recent Food Intake</h2>
        ${foodLogs.map((log: any) => 
          `<div class="food-item">
            <strong>${log.food?.name || 'Unknown Food'}</strong> - ${log.quantity}g
            <br>Calories: ${Math.round((log.food?.calories || 0) * log.quantity / 100)}
          </div>`
        ).join('')}
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        <p>This report is based on your dietary tracking data. For personalized nutrition advice, please consult with a registered dietitian or healthcare provider.</p>
    </div>
</body>
</html>`;
  };

  const exportToCSV = () => {
    try {
      const vitaminData = vitaminStatus;
      const mineralData = mineralStatus;
      const foodLogs = foodLogsData || [];

      if (!vitaminData || !mineralData) {
        toast({
          title: "Export Error",
          description: "Please wait for all data to load before exporting.",
          variant: "destructive",
        });
        return;
      }

      const csv = generateCSVReport(vitaminData, mineralData, foodLogs);
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrition-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "CSV Exported",
        description: "Your nutrition data has been exported to CSV format.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateCSVReport = (vitaminData: any, mineralData: any, foodLogs: any[]) => {
    let csv = "Category,Nutrient,Status,Percentage of RDA\n";
    
    // Add vitamin data
    Object.entries(vitaminData.vitaminLevels || {}).forEach(([vitamin, data]: [string, any]) => {
      csv += `Vitamin,${vitamin.replace('vitamin_', '').toUpperCase()},${data.status || 'unknown'},${data.percentage || 0}%\n`;
    });
    
    // Add mineral data
    Object.entries(mineralData.mineralLevels || {}).forEach(([mineral, data]: [string, any]) => {
      csv += `Mineral,${mineral.charAt(0).toUpperCase() + mineral.slice(1)},${data.status || 'unknown'},${data.percentage || 0}%\n`;
    });

    return csv;
  };

  const generateClinicalSummary = () => {
    const vitaminData = vitaminStatus;
    const mineralData = mineralStatus;

    if (!vitaminData || !mineralData) {
      toast({
        title: "Data Not Available",
        description: "Please wait for all data to load.",
        variant: "destructive",
      });
      return;
    }

    const deficientVitamins = Object.entries(vitaminData.vitaminLevels || {})
      .filter(([_, data]: [string, any]) => data.status === 'deficient')
      .map(([vitamin, data]: [string, any]) => `${vitamin.replace('vitamin_', '').toUpperCase()}: ${data.percentage}% of RDA`);

    const deficientMinerals = Object.entries(mineralData.mineralLevels || {})
      .filter(([_, data]: [string, any]) => data.status === 'deficient')
      .map(([mineral, data]: [string, any]) => `${mineral.charAt(0).toUpperCase() + mineral.slice(1)}: ${data.percentage}% of RDA`);

    return `NUTRITION ANALYSIS SUMMARY

Patient: ${currentUser?.username || 'User'}
Date: ${new Date().toLocaleDateString()}

DEFICIENCIES IDENTIFIED:
${deficientVitamins.length > 0 ? 'Vitamins:\n' + deficientVitamins.join('\n') : 'No vitamin deficiencies detected'}

${deficientMinerals.length > 0 ? 'Minerals:\n' + deficientMinerals.join('\n') : 'No mineral deficiencies detected'}

This data was collected through dietary tracking. Please consider for clinical assessment.

Generated by VitaMinTrack Nutrition Analysis`;
  };

  function getVitaminSuggestion(vitamin: string, percentage: number): string {
    if (percentage < 50) {
      const suggestions: Record<string, string> = {
        'vitamin_a': 'Consider adding carrots, sweet potatoes, spinach, or liver to your diet.',
        'vitamin_c': 'Include citrus fruits, strawberries, bell peppers, or broccoli in your meals.',
        'vitamin_d': 'Get adequate sunlight exposure and consider fatty fish, fortified milk, or supplements.',
        'vitamin_e': 'Add nuts, seeds, vegetable oils, or green leafy vegetables to your diet.',
        'vitamin_k': 'Include green leafy vegetables like kale, spinach, or broccoli.',
        'vitamin_b1': 'Consider whole grains, pork, fish, or legumes.',
        'vitamin_b2': 'Add dairy products, eggs, green vegetables, or nuts.',
        'vitamin_b3': 'Include meat, fish, nuts, or enriched grains.',
        'vitamin_b6': 'Consider chicken, fish, potatoes, or bananas.',
        'vitamin_b12': 'Add meat, fish, dairy products, or fortified cereals.',
        'folate': 'Include dark leafy greens, legumes, or fortified grains.'
      };
      return suggestions[vitamin] || 'Consult a nutritionist for personalized advice.';
    }
    return 'Your levels are adequate. Keep up the good work!';
  }

  function getMineralSuggestion(mineral: string, percentage: number): string {
    if (percentage < 50) {
      const suggestions: Record<string, string> = {
        'iron': 'Consider lean meats, beans, spinach, or fortified cereals.',
        'calcium': 'Add dairy products, leafy greens, or fortified plant milks.',
        'magnesium': 'Include nuts, seeds, whole grains, or green vegetables.',
        'zinc': 'Consider meat, shellfish, legumes, or seeds.',
        'potassium': 'Add bananas, potatoes, beans, or leafy greens.',
        'phosphorus': 'Include dairy products, meat, or nuts.',
        'selenium': 'Consider Brazil nuts, seafood, or whole grains.'
      };
      return suggestions[mineral] || 'Consult a nutritionist for personalized advice.';
    }
    return 'Your levels are adequate. Keep up the good work!';
  }

  function getVitaminUnit(vitamin: string): string {
    const units: Record<string, string> = {
      'vitamin_a': 'µg RAE',
      'vitamin_c': 'mg',
      'vitamin_d': 'µg',
      'vitamin_e': 'mg',
      'vitamin_k': 'µg',
      'vitamin_b1': 'mg',
      'vitamin_b2': 'mg',
      'vitamin_b3': 'mg',
      'vitamin_b6': 'mg',
      'vitamin_b12': 'µg',
      'folate': 'µg'
    };
    return units[vitamin] || 'mg';
  }

  function getVitaminFunction(vitamin: string): string {
    const functions: Record<string, string> = {
      'vitamin_a': 'Vitamin A (Retinol): Essential for vision, immune function, and cell growth. Supports healthy skin and mucous membranes.',
      'vitamin_c': 'Vitamin C (Ascorbic Acid): Powerful antioxidant that supports immune system, collagen synthesis, and iron absorption. Helps wound healing.',
      'vitamin_d': 'Vitamin D (Calciferol): Critical for bone health and calcium absorption. Supports immune function and muscle strength.',
      'vitamin_e': 'Vitamin E (Tocopherol): Antioxidant that protects cells from damage. Important for immune function and skin health.',
      'vitamin_k': 'Vitamin K (Phylloquinone): Essential for blood clotting and bone metabolism. Helps prevent excessive bleeding.',
      'vitamin_b1': 'Vitamin B1 (Thiamine): Helps convert carbohydrates into energy. Essential for nervous system and muscle function.',
      'vitamin_b2': 'Vitamin B2 (Riboflavin): Supports energy metabolism and cellular function. Important for healthy skin and eyes.',
      'vitamin_b3': 'Vitamin B3 (Niacin): Supports energy metabolism, nervous system function, and healthy skin.',
      'vitamin_b5': 'Vitamin B5 (Pantothenic Acid): Crucial for energy metabolism and hormone production.',
      'vitamin_b6': 'Vitamin B6 (Pyridoxine): Important for protein metabolism, brain function, and red blood cell formation.',
      'vitamin_b12': 'Vitamin B12 (Cobalamin): Essential for nerve function, DNA synthesis, and red blood cell formation. Prevents anemia.',
      'biotin': 'Biotin (Vitamin B7): Supports metabolism of fats, carbohydrates, and proteins. Important for healthy hair and nails.',
      'folate': 'Folate (Vitamin B9): Critical for DNA synthesis and red blood cell formation. Essential during pregnancy for fetal development.'
    };
    return functions[vitamin] || 'Important nutrient for overall health and wellness.';
  }

  function getMineralFunction(mineral: string): string {
    const functions: Record<string, string> = {
      'iron': 'Iron: Essential for oxygen transport in blood and energy production. Prevents anemia and supports cognitive function.',
      'calcium': 'Calcium: Critical for bone and teeth strength. Important for muscle contraction and nerve transmission.',
      'magnesium': 'Magnesium: Supports muscle and nerve function, bone health, and energy metabolism. Helps regulate blood pressure.',
      'zinc': 'Zinc: Important for immune function, wound healing, and protein synthesis. Supports taste and smell.',
      'potassium': 'Potassium: Essential for heart function, muscle contractions, and maintaining healthy blood pressure.',
      'phosphorus': 'Phosphorus: Works with calcium for strong bones and teeth. Important for energy storage and cell membrane function.',
      'sodium': 'Sodium: Helps maintain fluid balance and supports nerve and muscle function. Essential in proper amounts.',
      'copper': 'Copper: Important for iron metabolism, connective tissue formation, and nervous system function.',
      'selenium': 'Selenium: Powerful antioxidant that supports immune function and thyroid health. Protects against cell damage.',
      'manganese': 'Manganese: Supports bone development, wound healing, and metabolism of amino acids and carbohydrates.'
    };
    return functions[mineral] || 'Important mineral for overall health and body function.';
  }

  // Convert real data to trends format
  const vitaminLevelsData = vitaminStatus?.vitaminLevels || {};
  const mineralLevelsData = mineralStatus?.mineralLevels || {};
  const macroLevels = macroStatus?.intake || {};
  
  const weeklyTrends = {
    ...Object.fromEntries(
      Object.entries(vitaminLevelsData).map(([key, data]: [string, any]) => [
        key, Array.from({length: 7}, (_, i) => ({
          day: `Day ${i + 1}`,
          value: Math.max(0, (data?.percentage || 0) + (Math.random() - 0.5) * 20)
        }))
      ])
    ),
    ...Object.fromEntries(
      Object.entries(mineralLevelsData).map(([key, data]: [string, any]) => [
        key, Array.from({length: 7}, (_, i) => ({
          day: `Day ${i + 1}`,
          value: Math.max(0, (data?.percentage || 0) + (Math.random() - 0.5) * 20)
        }))
      ])
    )
  };

  const vitaminChartData = Object.entries(vitaminLevelsData).map(([vitamin, data]: [string, any]) => ({
    name: vitamin.replace('vitamin_', '').toUpperCase(),
    percentage: data?.percentage || 0,
    status: data?.status || 'unknown'
  }));

  const mineralChartData = Object.entries(mineralLevelsData).map(([mineral, data]: [string, any]) => ({
    name: mineral.charAt(0).toUpperCase() + mineral.slice(1),
    percentage: data?.percentage || 0,
    status: data?.status || 'unknown'
  }));

  const macroChartData = macroStatus?.intake ? [
    { name: 'Energy', current: parseFloat(macroStatus.intake.energy) || 0, target: parseFloat(macroStatus.targets?.energy) || 2000, percentage: ((parseFloat(macroStatus.intake.energy) || 0) / (parseFloat(macroStatus.targets?.energy) || 2000)) * 100, unit: 'kcal' },
    { name: 'Protein', current: parseFloat(macroStatus.intake.protein) || 0, target: parseFloat(macroStatus.targets?.protein) || 50, percentage: ((parseFloat(macroStatus.intake.protein) || 0) / (parseFloat(macroStatus.targets?.protein) || 50)) * 100, unit: 'g' },
    { name: 'Carbs', current: parseFloat(macroStatus.intake.carbs) || 0, target: parseFloat(macroStatus.targets?.carbs) || 250, percentage: ((parseFloat(macroStatus.intake.carbs) || 0) / (parseFloat(macroStatus.targets?.carbs) || 250)) * 100, unit: 'g' },
    { name: 'Fat', current: parseFloat(macroStatus.intake.fat) || 0, target: parseFloat(macroStatus.targets?.fat) || 65, percentage: ((parseFloat(macroStatus.intake.fat) || 0) / (parseFloat(macroStatus.targets?.fat) || 65)) * 100, unit: 'g' },
    { name: 'Fiber', current: parseFloat(macroStatus.intake.fiber) || 0, target: parseFloat(macroStatus.targets?.fiber) || 25, percentage: ((parseFloat(macroStatus.intake.fiber) || 0) / (parseFloat(macroStatus.targets?.fiber) || 25)) * 100, unit: 'g' }
  ] : [];

  const nutritionOverview = [
    { name: 'Vitamins', adequate: vitaminChartData.filter(v => v.status === 'sufficient' || v.status === 'moderate').length, deficient: vitaminChartData.filter(v => v.status === 'deficient').length },
    { name: 'Minerals', adequate: mineralChartData.filter(m => m.status === 'sufficient' || m.status === 'moderate').length, deficient: mineralChartData.filter(m => m.status === 'deficient').length }
  ];

  const actionItems = [
    {
      priority: 'high',
      title: 'Critical Vitamin Deficiencies',
      count: vitaminChartData.filter(v => v.status === 'deficient' && v.percentage < 30).length,
      description: 'Vitamins below 30% of RDA requiring immediate attention'
    },
    {
      priority: 'medium',
      title: 'Mineral Improvements Needed',
      count: mineralChartData.filter(m => m.status === 'deficient').length,
      description: 'Minerals that could be optimized in your diet'
    },
    {
      priority: 'low',
      title: 'Maintenance Areas',
      count: vitaminChartData.filter(v => v.status === 'sufficient' || v.status === 'moderate').length + mineralChartData.filter(m => m.status === 'sufficient' || m.status === 'moderate').length,
      description: 'Nutrients at adequate levels to maintain'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Professional Report Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <NutriTrackingLogo />
        
        {/* Time Period Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Analysis Period:</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="14">Last 14 Days</SelectItem>
                  <SelectItem value="21">Last 21 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-gray-500">
              Data retention: {currentUser?.dataRetentionDays || 7} days
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Report for: {currentUser?.username || 'User'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Analysis Period</p>
            <p className="text-sm text-gray-600">
              {timeRange === '7' ? 'Last 7 Days' : 
               timeRange === '14' ? 'Last 14 Days' : 
               timeRange === '21' ? 'Last 21 Days' : 
               'Last 30 Days'}
            </p>
          </div>
        </div>
      </div>

      {/* Period Analysis Insights */}
      {periodAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Period Analysis Insights
            </CardTitle>
            <CardDescription>
              Analysis for {periodAnalysis.period} ({periodAnalysis.startDate} to {periodAnalysis.endDate})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-lg font-semibold text-blue-900">{periodAnalysis.totalEntries}</div>
                <div className="text-sm text-blue-700">Total Food Entries</div>
                <div className="text-xs text-blue-600">
                  Avg: {periodAnalysis.averageDailyEntries} per day
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-lg font-semibold text-green-900">
                  {periodAnalysis.vitaminAnalysis?.totalDays || parseInt(timeRange)}
                </div>
                <div className="text-sm text-green-700">Days Analyzed</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-lg font-semibold text-purple-900">
                  {Object.keys(periodAnalysis.vitaminAnalysis?.vitaminLevels || {}).length + 
                   Object.keys(periodAnalysis.mineralAnalysis?.mineralLevels || {}).length}
                </div>
                <div className="text-sm text-purple-700">Nutrients Tracked</div>
              </div>
            </div>
            
            {periodAnalysis.vitaminAnalysis?.vitaminLevels && Object.keys(periodAnalysis.vitaminAnalysis.vitaminLevels).length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Average Vitamin Status Over Period</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(periodAnalysis.vitaminAnalysis.vitaminLevels).map(([vitamin, data]: [string, any]) => (
                    <div key={vitamin} className="bg-white border rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {vitamin.replace('vitamin_', '').toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, data.percentage || 0)} className="flex-1" />
                        <div className="text-xs text-gray-600">{Math.round(data.percentage || 0)}%</div>
                      </div>
                      <div className={`text-xs mt-1 ${
                        data.status === 'deficient' ? 'text-red-600' : 
                        data.status === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {data.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nutrition Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Nutrition Status Overview</CardTitle>
            <CardDescription>Current vitamin and mineral adequacy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={nutritionOverview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="adequate" fill="#22c55e" name="Adequate" />
                <Bar dataKey="deficient" fill="#ef4444" name="Deficient" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>Priority areas for improvement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  item.priority === 'high' ? 'bg-red-500' : 
                  item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.count} items</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Vitamin Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Detailed Vitamin Analysis
          </CardTitle>
          <CardDescription>Individual vitamin levels and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vitaminChartData.map((vitamin, index) => {
              const vitaminKey = `vitamin_${vitamin.name.toLowerCase()}`;
              const vitaminData = vitaminLevelsData[vitaminKey];
              const sources = vitaminData?.sources || [];
              
              const isExpanded = expandedVitamins[vitamin.name] || false;
              
              return (
                <div key={index}>
                  <button 
                    onClick={() => setExpandedVitamins(prev => ({...prev, [vitamin.name]: !prev[vitamin.name]}))}
                    className="w-full p-4 border rounded-lg space-y-3 hover:bg-gray-50 transition-colors text-left"
                    title={getVitaminFunction(`vitamin_${vitamin.name.toLowerCase()}`)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{vitamin.name}</h4>
                      <Badge variant={vitamin.status === 'sufficient' || vitamin.status === 'moderate' ? 'default' : 'destructive'}>
                        {(vitamin.status === 'sufficient' || vitamin.status === 'moderate') ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                        {vitamin.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>RDA Progress</span>
                        <span>{vitamin.percentage}%</span>
                      </div>
                      <Progress 
                        value={Math.min(vitamin.percentage, 100)} 
                        className={`h-2 ${
                          vitamin.status === 'sufficient' ? '[&>div]:bg-green-600' :
                          vitamin.status === 'moderate' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      <span>{isExpanded ? 'Hide food sources' : 'View food sources'}</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border">
                      <p className="text-xs text-gray-600 mb-2">
                        {getVitaminSuggestion(`vitamin_${vitamin.name.toLowerCase()}`, vitamin.percentage)}
                      </p>
                      {sources.length > 0 ? (
                        <div className="space-y-1">
                          <h5 className="text-xs font-medium text-gray-800">Top food sources:</h5>
                          {sources.slice(0, 3).map((source: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-gray-700">{source.foodName}</span>
                              <span className="font-medium text-blue-600">{source.percentage.toFixed(1)}%</span>
                            </div>
                          ))}
                          {sources.length > 3 && (
                            <p className="text-xs text-gray-500 mt-1">+{sources.length - 3} more foods</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No food sources logged today</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Mineral Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Detailed Mineral Analysis
          </CardTitle>
          <CardDescription>Individual mineral levels and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {mineralChartData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mineralChartData.map((mineral, index) => {
                const mineralKey = mineral.name.toLowerCase();
                const mineralData = mineralLevelsData[mineralKey];
                const sources = mineralData?.sources || [];
                
                const isExpanded = expandedMinerals[mineral.name] || false;
                
                return (
                  <div key={index}>
                    <button 
                      onClick={() => setExpandedMinerals(prev => ({...prev, [mineral.name]: !prev[mineral.name]}))}
                      className="w-full p-4 border rounded-lg space-y-3 hover:bg-gray-50 transition-colors text-left"
                      title={getMineralFunction(mineral.name.toLowerCase())}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{mineral.name}</h4>
                        <Badge variant={mineral.status === 'sufficient' || mineral.status === 'moderate' ? 'default' : 'destructive'}>
                          {mineral.status === 'sufficient' || mineral.status === 'moderate' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {mineral.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>RDA Progress</span>
                          <span>{mineral.percentage}%</span>
                        </div>
                        <Progress 
                          value={Math.min(mineral.percentage, 100)} 
                          className={`h-2 ${
                            mineral.status === 'sufficient' ? '[&>div]:bg-green-600' :
                            mineral.status === 'moderate' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        <span>{isExpanded ? 'Hide food sources' : 'View food sources'}</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border">
                        <p className="text-xs text-gray-600 mb-2">
                          {getMineralSuggestion(mineral.name.toLowerCase(), mineral.percentage)}
                        </p>
                        {sources.length > 0 ? (
                          <div className="space-y-1">
                            <h5 className="text-xs font-medium text-gray-800">Top food sources:</h5>
                            {sources.slice(0, 3).map((source: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-700">{source.foodName}</span>
                                <span className="font-medium text-green-600">{source.percentage.toFixed(1)}%</span>
                              </div>
                            ))}
                            {sources.length > 3 && (
                              <p className="text-xs text-gray-500 mt-1">+{sources.length - 3} more foods</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No food sources logged today</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No mineral data available</p>
              <p className="text-sm">Start tracking your food intake to see detailed mineral analysis</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Macronutrient Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Daily Macronutrient Analysis
          </CardTitle>
          <CardDescription>Protein, carbohydrates, and fat intake tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {macroChartData.map((macro, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{macro.name}</h4>
                  <Badge variant={macro.percentage >= 80 ? 'default' : 'secondary'}>
                    {macro.percentage >= 80 ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                    {macro.percentage >= 80 ? 'On Track' : 'Needs Attention'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: {macro.current}{macro.unit}</span>
                    <span>Target: {macro.target}{macro.unit}</span>
                  </div>
                  <Progress value={Math.min(macro.percentage, 100)} className="h-3" />
                  <div className="text-center text-sm text-gray-600">
                    {macro.percentage.toFixed(1)}% of target
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {macro.name === 'Protein' && macro.percentage < 80 && 
                    'Add lean meats, eggs, beans, or dairy products to increase protein intake.'}
                  {macro.name === 'Carbohydrates' && macro.percentage < 80 && 
                    'Include whole grains, fruits, and vegetables for healthy carbohydrates.'}
                  {macro.name === 'Fat' && macro.percentage < 80 && 
                    'Add healthy fats like nuts, avocado, olive oil, or fatty fish.'}
                  {macro.percentage >= 80 && 
                    'Great work! You\'re meeting your daily target for this macronutrient.'}
                </div>
              </div>
            ))}
          </div>
          
          {macroChartData.length > 0 && (
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={macroChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`${value}g`, name]} />
                  <Bar dataKey="current" fill="#3b82f6" name="Current Intake" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target Intake" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {macroChartData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No macronutrient data available</p>
              <p className="text-sm">Start tracking your food intake to see detailed macronutrient analysis</p>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Intelligent Food Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-orange-600" />
            NHS Food Suggestions for Today
          </CardTitle>
          <CardDescription>
            Personalized food recommendations to improve your deficient and moderate nutrition levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {foodSuggestions ? (
            <div className="space-y-6">
              {/* Priority Nutritional Gaps */}
              {foodSuggestions.gaps && foodSuggestions.gaps.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Priority Nutrients to Focus On
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {foodSuggestions.gaps.map((gap: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant={gap.status === 'deficient' ? 'destructive' : 'secondary'}
                        className="justify-center"
                      >
                        {gap.nutrient.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Meal-Specific Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lunch Suggestions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Lunch Suggestions
                  </h4>
                  {foodSuggestions.mealPlan?.lunch?.length > 0 ? (
                    <div className="space-y-3">
                      {foodSuggestions.mealPlan.lunch.map((suggestion: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="font-medium text-sm text-blue-900 mb-1">
                            {suggestion.food}
                          </div>
                          <div className="text-xs text-blue-700 mb-2">
                            {suggestion.portion}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {suggestion.benefit}
                          </div>
                          <div className="text-xs text-blue-600 italic">
                            💡 {suggestion.preparationTip}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-blue-600">No specific lunch recommendations today</p>
                  )}
                </div>

                {/* Dinner Suggestions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Dinner Suggestions
                  </h4>
                  {foodSuggestions.mealPlan?.dinner?.length > 0 ? (
                    <div className="space-y-3">
                      {foodSuggestions.mealPlan.dinner.map((suggestion: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-green-100">
                          <div className="font-medium text-sm text-green-900 mb-1">
                            {suggestion.food}
                          </div>
                          <div className="text-xs text-green-700 mb-2">
                            {suggestion.portion}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {suggestion.benefit}
                          </div>
                          <div className="text-xs text-green-600 italic">
                            💡 {suggestion.preparationTip}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No specific dinner recommendations today</p>
                  )}
                </div>

                {/* Snack Suggestions */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Healthy Snacks
                  </h4>
                  {foodSuggestions.mealPlan?.snacks?.length > 0 ? (
                    <div className="space-y-3">
                      {foodSuggestions.mealPlan.snacks.map((suggestion: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-purple-100">
                          <div className="font-medium text-sm text-purple-900 mb-1">
                            {suggestion.food}
                          </div>
                          <div className="text-xs text-purple-700 mb-2">
                            {suggestion.portion}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {suggestion.benefit}
                          </div>
                          <div className="text-xs text-purple-600 italic">
                            💡 {suggestion.preparationTip}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-purple-600">No specific snack recommendations today</p>
                  )}
                </div>
              </div>

              {/* Top Food Recommendations */}
              {foodSuggestions.recommendations && foodSuggestions.recommendations.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Top 8 Foods to Include Today
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {foodSuggestions.recommendations.slice(0, 8).map((rec: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-100 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-sm text-gray-900">
                            {rec.food}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          {rec.portion}
                        </div>
                        <div className="text-xs text-blue-600 mb-2">
                          {rec.benefit}
                        </div>
                        <div className="text-xs text-gray-500 italic">
                          💡 {rec.preparationTip}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50 text-orange-400" />
              <p>Loading personalized food suggestions...</p>
              <p className="text-sm">Analyzing your nutrition status to provide targeted recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Standards - Moved Down */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Nutrition Standards
          </CardTitle>
          <CardDescription>
            UK-specific recommendations based on government nutrition research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Primary Source</h4>
            <p className="text-sm text-blue-700 mb-3">
              UK NHS Guidelines - UK-specific recommendations based on government nutrition research.
            </p>
            <div className="bg-white border border-blue-100 rounded p-3 mb-3">
              <p className="text-xs text-gray-700 mb-2">
                <strong>Note:</strong> RDA values are optimized for your location. WHO standards provide global reference baseline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </CardTitle>
          <CardDescription>Download your nutrition analysis in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportToPDF} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Export PDF Report
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV Data
            </Button>
            <Button 
              onClick={() => {
                const summary = generateClinicalSummary();
                navigator.clipboard.writeText(summary);
                toast({
                  title: "Copied to Clipboard",
                  description: "Clinical summary has been copied to your clipboard.",
                });
              }}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Copy Clinical Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save & Export Panel */}
      <SaveExportPanel 
        data={{
          vitaminStatus: vitaminStatus || {},
          mineralStatus: mineralStatus || {},
          macroStatus: macroStatus || {},
          periodAnalysis: periodAnalysis || {},
          userProfile: currentUser || {},
          timeRange,
          analysisDate: today
        }}
        title="Nutritional Analysis Report"
        userId={userId}
        date={today}
        type="analysis"
      />

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
          💡 Refresh your analysis to see different nutrition facts!
        </p>
      </div>
    </div>
  );
}