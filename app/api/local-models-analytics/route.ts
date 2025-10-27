import { NextRequest, NextResponse } from 'next/server';
import { dbManager, initializeSampleData } from '@/lib/simple-database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'init':
        await initializeSampleData();
        return NextResponse.json({ success: true, message: 'Sample data initialized' });
        
      case 'stats':
        const modelStats = await dbManager.getModelPerformanceSummary();
        const providerStats = await dbManager.getProviderComparison();
        const websites = await dbManager.getAllWebsites();
        
        return NextResponse.json({
          success: true,
          data: {
            models: modelStats,
            providers: providerStats,
            websites: websites.slice(0, 10), // Limit to 10 most recent
            totalWebsites: websites.length
          }
        });
        
      case 'export':
        const exportData = await dbManager.exportData();
        return NextResponse.json({
          success: true,
          data: exportData
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use ?action=init, ?action=stats, or ?action=export'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('[local-models-analytics] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { model_name } = await request.json();
    
    if (!model_name) {
      return NextResponse.json({
        success: false,
        error: 'model_name is required'
      }, { status: 400 });
    }
    
    const stats = await dbManager.getModelStats(model_name);
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('[local-models-analytics] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}