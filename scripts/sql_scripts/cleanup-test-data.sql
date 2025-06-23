-- Cleanup script to remove test endpoint data
-- This will remove all test-related entries from the database

-- Remove test endpoint from status_checks
DELETE FROM status_checks 
WHERE endpoint_path = '/test' 
   OR endpoint_path = '/test-rls'
   OR endpoint_name = 'Test Endpoint';

-- Remove test endpoint from daily_metrics
DELETE FROM daily_metrics 
WHERE endpoint_path = '/test' 
   OR endpoint_path = '/test-rls';

-- Remove test endpoint from performance_metrics
DELETE FROM performance_metrics 
WHERE endpoint_path = '/test' 
   OR endpoint_path = '/test-rls';

-- Remove test endpoint from request_logs
DELETE FROM request_logs 
WHERE endpoint_path = '/test' 
   OR endpoint_path = '/test-rls';

-- Show cleanup results
SELECT 
    'status_checks' as table_name,
    COUNT(*) as remaining_records
FROM status_checks 
WHERE endpoint_path = '/test' OR endpoint_path = '/test-rls'

UNION ALL

SELECT 
    'daily_metrics' as table_name,
    COUNT(*) as remaining_records
FROM daily_metrics 
WHERE endpoint_path = '/test' OR endpoint_path = '/test-rls'

UNION ALL

SELECT 
    'performance_metrics' as table_name,
    COUNT(*) as remaining_records
FROM performance_metrics 
WHERE endpoint_path = '/test' OR endpoint_path = '/test-rls'

UNION ALL

SELECT 
    'request_logs' as table_name,
    COUNT(*) as remaining_records
FROM request_logs 
WHERE endpoint_path = '/test' OR endpoint_path = '/test-rls'; 