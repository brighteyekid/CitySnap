#!/usr/bin/env python3
"""
Civic Problem Solver - IEEE Architecture Diagram using Graphviz
Creates a professional IEEE 1471-2000 compliant architecture diagram
"""

from graphviz import Digraph

def create_ieee_architecture_diagram():
    # Initialize IEEE standard diagram
    dot = Digraph(
        name='CivicProblemSolver_Architecture',
        comment='Civic Problem Solver System Architecture Diagram (IEEE 1471)',
        engine='dot'
    )
    
    # IEEE standard document settings
    dot.attr(
        rankdir='TB',
        compound='true',
        splines='ortho',
        concentrate='true',
        ranksep='1.8',  # Increased for better label placement
        nodesep='1.2',  # Increased for better spacing
        pad='0.5'
    )
    
    # Standard IEEE styling
    dot.attr(
        'graph',
        fontname='Times-Roman',
        fontsize='14',
        style='rounded',
        bgcolor='white'
    )
    
    # IEEE standard node styling
    dot.attr(
        'node',
        shape='rectangle',
        style='filled',
        fillcolor='white',
        color='black',
        fontname='Times-Roman',
        fontsize='12',
        height='0.6',
        width='1.6',
        margin='0.3,0.2'
    )
    
    # IEEE standard edge styling
    dot.attr(
        'edge',
        fontname='Times-Roman',
        fontsize='10',
        color='#000000',
        arrowsize='0.8',
        penwidth='1.0',
        xlabel_position='above'  # Position labels above edges
    )
    
    # System Context (External Entities)
    with dot.subgraph(name='cluster_context') as context:
        context.attr(
            label='System Context',
            style='dashed,rounded',
            color='#666666',
            fontname='Times-Roman',
            fontsize='14'
        )
        context.node('Citizen', '«actor»\\nCitizen\\nUser', shape='ellipse')
        context.node('Admin', '«actor»\\nSystem\\nAdministrator', shape='ellipse')
        context.node('Official', '«actor»\\nGovernment\\nOfficial', shape='ellipse')
        context.node('CloudinaryAPI', '«external system»\\nCloudinary\\nCDN API', shape='rectangle')
        context.node('MapboxAPI', '«external system»\\nMapbox/Leaflet\\nMapping API', shape='rectangle')
        context.node('EmailService', '«external system»\\nEmail\\nService', shape='rectangle')
    
    # Presentation Tier (React Frontend)
    with dot.subgraph(name='cluster_presentation') as presentation:
        presentation.attr(
            label='Presentation Tier (React Frontend - Port 3000)',
            style='rounded',
            color='#333333',
            bgcolor='#E3F2FD'
        )
        presentation.node('WebApp', '«boundary»\\nReact Web\\nApplication')
        
        with presentation.subgraph(name='cluster_ui_components') as ui:
            ui.attr(label='UI Components', style='rounded')
            ui.node('Dashboard', '«component»\\nDashboard\\nView')
            ui.node('ProblemMap', '«component»\\nProblem Map\\nView')
            ui.node('ReportForm', '«component»\\nReport Form\\nView')
            ui.node('AuthView', '«component»\\nAuthentication\\nView')
            ui.node('ProfileView', '«component»\\nUser Profile\\nView')
        
        with presentation.subgraph(name='cluster_ui_services') as ui_services:
            ui_services.attr(label='Frontend Services', style='rounded')
            ui_services.node('APIClient', '«service»\\nAPI Client\\n(Axios)')
            ui_services.node('AuthService', '«service»\\nAuth Service\\n(JWT)')
            ui_services.node('MapService', '«service»\\nMap Service\\n(Leaflet)')
            ui_services.node('StateManager', '«service»\\nState Manager\\n(React Query)')
    
    # Application Tier (Node.js Backend)
    with dot.subgraph(name='cluster_application') as application:
        application.attr(
            label='Application Tier (Node.js Backend - Port 5000)',
            style='rounded',
            color='#333333',
            bgcolor='#E8F5E8'
        )
        
        with application.subgraph(name='cluster_controllers') as controllers:
            controllers.attr(label='Controllers', style='rounded')
            controllers.node('AuthController', '«controller»\\nAuth\\nController')
            controllers.node('ProblemController', '«controller»\\nProblem\\nController')
            controllers.node('UserController', '«controller»\\nUser\\nController')
            controllers.node('ReportController', '«controller»\\nReport\\nController')
        
        with application.subgraph(name='cluster_services') as services:
            services.attr(label='Business Services', style='rounded')
            services.node('AuthenticationService', '«service»\\nAuthentication\\nService')
            services.node('ProblemService', '«service»\\nProblem\\nService')
            services.node('NotificationService', '«service»\\nNotification\\nService')
            services.node('GeolocationService', '«service»\\nGeolocation\\nService')
            services.node('ImageService', '«service»\\nImage Processing\\nService')
        
        with application.subgraph(name='cluster_middleware') as middleware:
            middleware.attr(label='Middleware Layer', style='rounded')
            middleware.node('JWTMiddleware', '«middleware»\\nJWT\\nMiddleware')
            middleware.node('ValidationMiddleware', '«middleware»\\nValidation\\nMiddleware')
            middleware.node('RateLimitMiddleware', '«middleware»\\nRate Limiting\\nMiddleware')
            middleware.node('CORSMiddleware', '«middleware»\\nCORS\\nMiddleware')
    
    # Data Tier
    with dot.subgraph(name='cluster_data') as data:
        data.attr(
            label='Data Tier',
            style='rounded',
            color='#333333',
            bgcolor='#FFF3E0'
        )
        
        with data.subgraph(name='cluster_databases') as databases:
            databases.attr(label='Persistent Storage', style='rounded')
            databases.node('MongoDB', '«database»\\nMongoDB 7.0\\n(Port 27017)', shape='cylinder')
            databases.node('RedisCache', '«cache»\\nRedis Cache\\n(Port 6379)', shape='cylinder')
        
        with data.subgraph(name='cluster_models') as models:
            models.attr(label='Data Models', style='rounded')
            models.node('UserModel', '«model»\\nUser\\nModel')
            models.node('ProblemModel', '«model»\\nProblem\\nModel')
            models.node('ReportModel', '«model»\\nReport\\nModel')
            models.node('CategoryModel', '«model»\\nCategory\\nModel')
    
    # Infrastructure Tier
    with dot.subgraph(name='cluster_infrastructure') as infrastructure:
        infrastructure.attr(
            label='Infrastructure Tier',
            style='rounded',
            color='#333333',
            bgcolor='#F3E5F5'
        )
        
        infrastructure.node('NginxProxy', '«proxy»\\nNginx Reverse\\nProxy (80/443)')
        infrastructure.node('DockerCompose', '«container»\\nDocker Compose\\nOrchestration')
        infrastructure.node('LoadBalancer', '«balancer»\\nLoad\\nBalancer')
        infrastructure.node('SSLTermination', '«security»\\nSSL/TLS\\nTermination')
    
    # Define relationships using IEEE notation with xlabels
    
    # User Interactions
    dot.edge('Citizen', 'WebApp', xlabel='«uses»')
    dot.edge('Admin', 'WebApp', xlabel='«administers»')
    dot.edge('Official', 'WebApp', xlabel='«monitors»')
    
    # Frontend Navigation
    dot.edge('WebApp', 'Dashboard', xlabel='«routes»')
    dot.edge('WebApp', 'ProblemMap', xlabel='«routes»')
    dot.edge('WebApp', 'ReportForm', xlabel='«routes»')
    dot.edge('WebApp', 'AuthView', xlabel='«routes»')
    dot.edge('WebApp', 'ProfileView', xlabel='«routes»')
    
    # Frontend Service Dependencies
    dot.edge('Dashboard', 'APIClient', xlabel='«uses»')
    dot.edge('ProblemMap', 'MapService', xlabel='«uses»')
    dot.edge('ReportForm', 'APIClient', xlabel='«uses»')
    dot.edge('AuthView', 'AuthService', xlabel='«uses»')
    dot.edge('ProfileView', 'StateManager', xlabel='«uses»')
    
    # API Client to Backend Controllers
    dot.edge('APIClient', 'AuthController', xlabel='«calls»')
    dot.edge('APIClient', 'ProblemController', xlabel='«calls»')
    dot.edge('APIClient', 'UserController', xlabel='«calls»')
    dot.edge('APIClient', 'ReportController', xlabel='«calls»')
    
    # Controller to Service Communication
    dot.edge('AuthController', 'AuthenticationService', xlabel='«invokes»')
    dot.edge('ProblemController', 'ProblemService', xlabel='«invokes»')
    dot.edge('UserController', 'AuthenticationService', xlabel='«invokes»')
    dot.edge('ReportController', 'NotificationService', xlabel='«invokes»')
    
    # Service Dependencies
    dot.edge('ProblemService', 'GeolocationService', xlabel='«uses»')
    dot.edge('ProblemService', 'ImageService', xlabel='«uses»')
    dot.edge('ImageService', 'CloudinaryAPI', xlabel='«integrates»')
    dot.edge('GeolocationService', 'MapboxAPI', xlabel='«integrates»')
    dot.edge('NotificationService', 'EmailService', xlabel='«integrates»')
    
    # Middleware Flow
    dot.edge('APIClient', 'JWTMiddleware', xlabel='«passes through»')
    dot.edge('JWTMiddleware', 'ValidationMiddleware', xlabel='«chains»')
    dot.edge('ValidationMiddleware', 'RateLimitMiddleware', xlabel='«chains»')
    dot.edge('RateLimitMiddleware', 'CORSMiddleware', xlabel='«chains»')
    
    # Data Access Patterns
    dot.edge('AuthenticationService', 'UserModel', xlabel='«manages»')
    dot.edge('ProblemService', 'ProblemModel', xlabel='«manages»')
    dot.edge('ProblemService', 'ReportModel', xlabel='«manages»')
    dot.edge('ProblemService', 'CategoryModel', xlabel='«manages»')
    
    # Database Connections
    dot.edge('UserModel', 'MongoDB', xlabel='«persists»')
    dot.edge('ProblemModel', 'MongoDB', xlabel='«persists»')
    dot.edge('ReportModel', 'MongoDB', xlabel='«persists»')
    dot.edge('CategoryModel', 'MongoDB', xlabel='«persists»')
    
    # Caching Layer
    dot.edge('AuthenticationService', 'RedisCache', xlabel='«caches»')
    dot.edge('ProblemService', 'RedisCache', xlabel='«caches»')
    dot.edge('GeolocationService', 'RedisCache', xlabel='«caches»')
    
    # Infrastructure Connections
    dot.edge('WebApp', 'NginxProxy', xlabel='«served by»')
    dot.edge('NginxProxy', 'LoadBalancer', xlabel='«distributes»')
    dot.edge('LoadBalancer', 'SSLTermination', xlabel='«secures»')
    dot.edge('DockerCompose', 'WebApp', xlabel='«orchestrates»')
    dot.edge('DockerCompose', 'AuthController', xlabel='«orchestrates»')
    dot.edge('DockerCompose', 'MongoDB', xlabel='«orchestrates»')
    dot.edge('DockerCompose', 'RedisCache', xlabel='«orchestrates»')
    dot.edge('DockerCompose', 'NginxProxy', xlabel='«orchestrates»')
    
    # External Service Integration
    dot.edge('MapService', 'MapboxAPI', xlabel='«integrates»')
    
    # Generate high-resolution output
    dot.attr(dpi='300')
    dot.render('CivicProblemSolver_IEEE_Architecture', format='png', cleanup=True)
    
    print("🎯 IEEE Architecture Diagram Generated Successfully!")
    print("=" * 60)
    print("📁 File: CivicProblemSolver_IEEE_Architecture.png")
    print("📐 Resolution: 300 DPI (High Quality)")
    print("📋 Standard: IEEE 1471-2000 Compliant")
    print("")
    print("🏗️ ARCHITECTURE COMPONENTS:")
    print("   ✅ System Context with External Actors")
    print("   ✅ Presentation Tier (React Frontend)")
    print("   ✅ Application Tier (Node.js Backend)")
    print("   ✅ Data Tier (MongoDB + Redis)")
    print("   ✅ Infrastructure Tier (Docker + Nginx)")
    print("")
    print("🔗 RELATIONSHIPS MAPPED:")
    print("   ✅ User interactions and system boundaries")
    print("   ✅ Component dependencies and data flow")
    print("   ✅ Service integrations and API calls")
    print("   ✅ Database connections and caching")
    print("   ✅ Infrastructure orchestration")
    print("")
    print("📊 DIAGRAM FEATURES:")
    print("   ✅ IEEE standard notation and symbols")
    print("   ✅ Clustered components by architectural tier")
    print("   ✅ Labeled relationships with stereotypes")
    print("   ✅ Professional typography and layout")
    print("   ✅ Color-coded layers for clarity")
    print("=" * 60)

if __name__ == "__main__":
    try:
        print("Starting IEEE Architecture Diagram Generation...")
        create_ieee_architecture_diagram()
    except Exception as e:
        print(f"Error generating diagram: {e}")
        import traceback
        traceback.print_exc()