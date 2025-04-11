"use client";

import React, { useState, useMemo } from 'react';
import {
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from '@/components/ProtectedRoute';

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(value);
};

export default function SipCalculatorPage() {
  const [sipType, setSipType] = useState('regular');
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(10);
  const [annualIncrease, setAnnualIncrease] = useState<number>(10);
  const [calculationResult, setCalculationResult] = useState<{
    investedAmount: number;
    estimatedReturns: number;
    totalValue: number;
  } | null>(null);

  const handleCalculate = () => {
    const P = monthlyInvestment;
    const annualRate = expectedReturnRate / 100;
    const years = investmentPeriod;
    const n = years * 12; // months
    const monthlyRate = annualRate / 12;
    const increaseRate = annualIncrease / 100;

    let totalValue = 0;
    let investedAmount = 0;

    if (P <= 0 || annualRate <= 0 || years <= 0) {
        setCalculationResult(null);
        return;
    }

    if (sipType === 'regular') {
        if (monthlyRate > 0) {
             totalValue = P * (((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate));
        } else {
            totalValue = P * n; // Handle 0% return rate
        }
        investedAmount = P * n;
    } else if (sipType === 'step-up') {
        if (monthlyRate > 0 && P > 0) {
            let currentInvestment = P;
            for (let year = 1; year <= years; year++) {
                 let yearlyInvested = 0;
                 for (let month = 1; month <= 12; month++) {
                     const monthsRemaining = (years - year + 1) * 12 - month;
                     totalValue += currentInvestment * Math.pow(1 + monthlyRate, monthsRemaining);
                     yearlyInvested += currentInvestment;
                 }
                 investedAmount += yearlyInvested;
                 // Apply increase for the next year
                 currentInvestment = currentInvestment * (1 + increaseRate);
            }
        } else {
            // Basic step-up calculation without interest (less common use case)
            let currentP = P;
            for (let y = 0; y < years; y++) {
               investedAmount += currentP * 12;
               currentP *= (1 + increaseRate);
            }
             totalValue = investedAmount; // No returns calculated for 0% rate
        }
    }

    totalValue = Math.round(totalValue);
    investedAmount = Math.round(investedAmount);
    const estimatedReturns = totalValue - investedAmount;

    setCalculationResult({
        investedAmount,
        estimatedReturns,
        totalValue,
    });
  };

  // Use useMemo to calculate derived values only when dependencies change
  const investedAmountDisplay = useMemo(() => calculationResult ? formatCurrency(calculationResult.investedAmount) : '-', [calculationResult]);
  const estimatedReturnsDisplay = useMemo(() => calculationResult ? formatCurrency(calculationResult.estimatedReturns) : '-', [calculationResult]);
  const totalValueDisplay = useMemo(() => calculationResult ? formatCurrency(calculationResult.totalValue) : '-', [calculationResult]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">SIP Calculator</h1>
        <p className="text-muted-foreground">
          Estimate the future value of your monthly investments.
        </p>

        <Tabs value={sipType} onValueChange={setSipType} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="regular">Regular SIP</TabsTrigger>
            <TabsTrigger value="step-up">Step-Up SIP</TabsTrigger>
          </TabsList>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Monthly Investment (Common) */} 
              <div className="space-y-2">
                <Label htmlFor="monthlyInvestment">Monthly Investment (₹)</Label>
                <Input 
                  id="monthlyInvestment"
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value) || 0)}
                  placeholder="e.g., 10000"
                  min="500"
                />
                <Slider
                   value={[monthlyInvestment]}
                   onValueChange={(value) => setMonthlyInvestment(value[0])}
                   max={100000} 
                   step={500}
                   className="mt-2"
                 />
              </div>

              {/* Annual Increase (Only for Step-Up) */} 
              {sipType === 'step-up' && (
                <div className="space-y-2">
                  <Label htmlFor="annualIncrease">Annual Increase (%)</Label>
                  <Input 
                    id="annualIncrease"
                    type="number"
                    value={annualIncrease}
                    onChange={(e) => setAnnualIncrease(Number(e.target.value) || 0)}
                    placeholder="e.g., 10"
                    min="0"
                    max="25"
                  />
                   <Slider
                     value={[annualIncrease]}
                     onValueChange={(value) => setAnnualIncrease(value[0])}
                     max={25} 
                     step={1}
                     className="mt-2"
                   />
                </div>
              )}

              {/* Expected Return Rate (Common) */} 
              <div className="space-y-2">
                <Label htmlFor="returnRate">Expected Return Rate (% p.a.)</Label>
                <Input 
                  id="returnRate"
                  type="number"
                  value={expectedReturnRate}
                  onChange={(e) => setExpectedReturnRate(Number(e.target.value) || 0)}
                  placeholder="e.g., 12"
                  min="1"
                  max="30"
                />
                <Slider
                   value={[expectedReturnRate]}
                   onValueChange={(value) => setExpectedReturnRate(value[0])}
                   max={30} 
                   step={0.5}
                   className="mt-2"
                 />
              </div>

              {/* Investment Period (Common) */} 
              <div className="space-y-2">
                <Label htmlFor="investmentPeriod">Investment Period (Years)</Label>
                <Input 
                  id="investmentPeriod"
                  type="number"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(Number(e.target.value) || 0)}
                  placeholder="e.g., 10"
                  min="1"
                  max="40"
                />
                 <Slider
                   value={[investmentPeriod]}
                   onValueChange={(value) => setInvestmentPeriod(value[0])}
                   max={40} 
                   step={1}
                   className="mt-2"
                 />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCalculate}>Calculate Future Value</Button>
            </CardFooter>
          </Card>
        </Tabs>

        {calculationResult && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Estimated Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invested Amount:</span>
                <span className="font-medium">{investedAmountDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Returns:</span>
                <span className="font-medium">{estimatedReturnsDisplay}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-green-700">Total Future Value:</span>
                <span className="text-green-700">{totalValueDisplay}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold border-b pb-2">Understanding SIP Types</h2>
          <Card>
            <CardHeader><CardTitle>Regular SIP</CardTitle></CardHeader>
            <CardContent><p>Regular SIP is the most popular method with a fixed monthly investment amount and tenure. It helps average out purchase costs over time (Rupee Cost Averaging).</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Step-Up SIP / Top-Up SIP</CardTitle></CardHeader>
            <CardContent><p>Allows you to increase your monthly investment amount periodically (usually annually) by a fixed amount or percentage. Aligns investment growth with potential income growth.</p></CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Flexible SIP</CardTitle></CardHeader>
            <CardContent><p>Allows investors to increase or decrease the investment amount based on cash flow or market views. Suitable for variable income earners.</p></CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Trigger SIP</CardTitle></CardHeader>
            <CardContent><p>Investments are made only when specific market conditions or triggers (like a certain NAV or index level) are met. Requires market understanding.</p></CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Perpetual SIP</CardTitle></CardHeader>
            <CardContent><p>A regular SIP without a defined end date. Suitable for very long-term goals like retirement. Requires manual instruction to stop.</p></CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Multi SIP</CardTitle></CardHeader>
            <CardContent><p>Allows investing in multiple schemes within the same fund house through a single mandate, aiding diversification.</p></CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Equity / Debt SIP</CardTitle></CardHeader>
            <CardContent><p>Refers to the underlying asset class (stocks or bonds/fixed income) of the mutual fund you are investing in via SIP. Determines risk and potential return.</p></CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Tax-Saving SIP (ELSS)</CardTitle></CardHeader>
            <CardContent><p>SIP investment in Equity-Linked Savings Schemes (ELSS) funds, offering tax benefits under Section 80C with a 3-year lock-in.</p></CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>SIP with Insurance</CardTitle></CardHeader>
            <CardContent><p>Some fund houses offer complimentary term life insurance cover bundled with SIP investments, typically in equity funds, to encourage long-term investing.</p></CardContent>
          </Card>
          {/* Add more explanations as needed */}
        </div>
      </div>
    </ProtectedRoute>
  );
} 